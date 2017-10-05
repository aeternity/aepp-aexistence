import machine from './../machine.js'
import Speech from './Speech.vue'
import Answer from './Answer.vue'
import waterfall from 'async/waterfall'
import parallel from 'async/parallel'

import helperMixin from '../mixins/helper.js';

import MessageSenderEnum from '../MessageSenderEnum.js'
import MessageBodyTypeEnum from '../MessageBodyTypeEnum.js'

export default {
		name: 'chat',
		components: {
			'speech': Speech,
			'Answer': Answer
		},
		mixins: [
			helperMixin
		],
		data: function() {
			return {
				machine: machine(),
				messages: [],
				showti: false,
				showresp: false,
				showFileUpload: false,
				showFreetext: false,
				userInput: '',
				fileUploadFormData: new FormData(),
				proof: {
					hash: null,
					description: null,
					ipfsHash: null,
					txId: null,
					dataUrl: null
				}
			}
		},
		computed: {
			answers: function() {
				return this.machine.getCurrentQuestion().getPossibleAnswers();
			},
			hasAnswers: function() {
				return this.answers && this.answers.length > 0;
			},
			contractReady: function() {
				return this.$store.state.contractReady;
			}
		},
		methods: {
			scrollDown: function() {
				setTimeout(function(){
					document.getElementsByClassName('conversation-container')[0].scrollTop = 100000000
				},100);
			},
			handleAnswer: function(givenAnswer) {
				this.setAnswer(givenAnswer.name);
			},
			handleFreetextInput: function() {
				this.setAnswer(this.userInput);
				this.userInput = '';
			},
			setAnswer: function(answerText) {
				this.addMessage({
					sender: MessageSenderEnum.ME,
					body: {
						type: MessageBodyTypeEnum.TEXT,
						text: answerText,
					},
				});
				this.machine.setAnswer(answerText);
			},
			showQuestionDelayed: function(text) {
				this.addMessageDelayed({
					sender: MessageSenderEnum.APP,
					body: {
						type: MessageBodyTypeEnum.TEXT,
						text: text,
					},
				}, 1000, true);
			},
			addMessageDelayed: function(message, delay, showThinkingBubble) {
				console.log('addMessageDelayed');
				if (showThinkingBubble) {
					this.showti = true;
				}
				setTimeout(() => {
					if (showThinkingBubble) {
						this.showti = false;
					}
					this.addMessage(message);
				}, delay);
			},
			startProof: function(textToProof, comment, ipfsHash) {
				console.log('startProof', textToProof, comment, ipfsHash);
				let contract = window.globalContract;
				let tokenContract = window.globalTokenContract;
				if (!contract || !tokenContract) {
					return
				}

				waterfall([
					(callback) => {
						window.globalWeb3.eth.getAccounts((err, accounts) => {
							if (err) {
								return callback(err);
							} else if (accounts.length === 0) {
								return callback(new Error('No accounts found'));
							}
							tokenContract.balanceOf(accounts[0], {}, (err, balance) => {
								if (err) {
									return callback(err);
								}
								if (balance <= 0) {
									this.addMessageDelayed({
										sender: MessageSenderEnum.APP,
										body: {
											type: MessageBodyTypeEnum.TEXT,
											text: "You don't have any AE Tokens. The contract will fail without tokens."
										},
									}, 1000, true);
									this.machine.transition('clear');
									return callback(new Error('No AE Token'));
								}
								return callback(null);
							});
						});
					},
					(callback) => {
						contract.hasProof(textToProof, (err, hasProof) => {
							if (hasProof) {
								this.addMessageDelayed({
									sender: MessageSenderEnum.APP,
									body: {
										type: MessageBodyTypeEnum.LINK,
										description: "This file has already been notarized",
										title: textToProof,
										url: this.$router.resolve('/proofs/' + textToProof).href
									},
								}, 1000, true);
								this.machine.transition('clear');
								return callback(new Error('Already notarized'));
							} else {
								return callback(null);
							}
						});
					},
					(callback) => {
						window.globalWeb3.eth.getAccounts((err, accounts) => {
							if (err) {
								return callback(err);
							} else if (accounts.length === 0) {
								return callback(new Error('No accounts found'));
							}
							contract.notarize.estimateGas(textToProof, comment, ipfsHash, {from : accounts[0]}, (err, estimate) => {
								return callback(err, estimate);
							});
						})
					},
					(estimate, callback) => {
						window.globalWeb3.eth.getAccounts((err, accounts) => {
							if (err) {
								return callback(err);
							} else if (accounts.length === 0) {
								return callback(new Error('No accounts found'));
							}
							console.log('estimate', estimate, );
							let transactionOptions = {
								from : accounts[0],
								gas: estimate,
								gasPrice: window.globalWeb3.toWei(this.$store.state.gasPrice, 'gwei')
							};
							contract.notarize(textToProof, comment, ipfsHash, transactionOptions, (err, txId) => {
								return callback(err, txId);
							});
						});
					}
				], (err, txId) => {
					if (err) {
						this.machine.transition('transactionError');
					} else {
						this.proof.txId = txId;
						this.showTransactionId(txId);
						this.machine.transition('showSuccess');
					}
				});
			},
			showTransactionId: function(txId) {
				this.addMessageDelayed({
					sender: MessageSenderEnum.APP,
					body: {
						type: MessageBodyTypeEnum.LINK,
						description: "This is the Transaction ID",
						title: txId,
						url: this.etherscanLink(txId, 'tx')
					},
				}, 1000, true);
			},
			onFileChange: function(event) {
				console.log('onFileChange', event.target.files, this.machine);
				this.fileUploadFormData.set('file', event.target.files[0]);

				parallel({
					dataUrl: (callback) => {
						this.getImageDataUrl(this.fileUploadFormData.get('file'), (err, dataUrl) => {
							console.log('getImageDataUrl', err);
							if (err) {
								return callback(err);
							}
							this.proof.dataUrl = dataUrl;
							return callback(null, dataUrl);
						});
					},
					hasProof: (callback) => {
						this.generateFileHash(this.fileUploadFormData.get('file'), (err, hash) => {
							if (err) {
								return callback(err);
							} else {
								this.proof.hash = hash;
								//check proof for existence
								window.globalContract.hasProof(hash, (err, hasProof) => {
									return callback(err, hasProof);
								});
							}
						});
					},
				}, (err, result) => {
					console.log(err, result);
					if (err) {
						//TODO: error handling
					} else {
						if (result.dataUrl) {
							this.addMessage({
								sender: MessageSenderEnum.ME,
								body: {
									type: MessageBodyTypeEnum.IMAGE,
									image: result.dataUrl
								}
							});
						}
						if (result.hasProof) {
							this.machine.transition('proofExists');
						} else {
							this.machine.transition('giveName');
						}
					}
				});
			},
			preventSubmit: function(event) {
				event.preventDefault();
			},
			showExistingProof: function() {
				let hash = this.proof.hash;
				this.addMessageDelayed({
					sender: MessageSenderEnum.APP,
					body: {
						type: MessageBodyTypeEnum.LINK,
						description: "This file has already been notarized",
						title: hash,
						url: this.$router.resolve('/proofs/' + hash).href
					},
				}, 1000, true);
			},
			checkImage: function() {
				this.generateFileHash(this.fileUploadFormData.get('file'), (err, hash) => {
					if (err) {
						this.addMessage({
							sender: MessageSenderEnum.APP,
							body: {
								type: MessageBodyTypeEnum.TEXT,
								text: 'Something went wrong D: ',
							},
						});
						return false;
					}
					if (this.contractReady) {
						window.globalContract.hasProof(hash, (err, hasProof) => {
							if (err) {
								//TODO: handle
								console.log(err);
							} else {
								if (hasProof) {
									this.addMessageDelayed({
										sender: MessageSenderEnum.APP,
										body: {
											type: MessageBodyTypeEnum.LINK,
											description: "This file has already been notarized",
											title: hash,
											url: this.$router.resolve('/proofs/' + hash).href
										},
									}, 1000, true);
								} else {
									this.addMessageDelayed({
										sender: MessageSenderEnum.APP,
										body: {
											type: MessageBodyTypeEnum.TEXT,
											text: "No proof found for this file! " + hash
										},
									}, 1000, true);
								}
							}
						});
					} else {
						console.log('contract not ready');
					}
				});
			},
			startUpload: function(event) {
				if (event) {
					event.preventDefault();
				}
				this.$http.post(this.$store.state.apiBaseUrl + '/upload', this.fileUploadFormData).then(response => {
					console.log('yay', response);
					let hash = this.proof.hash;
					this.proof.ipfsHash = response.body.hash;
					this.machine.transition('showSummary');
				}, response => {
					console.log('nay', response);
					this.addMessage({
						sender: MessageSenderEnum.APP,
						body: {
							type: MessageBodyTypeEnum.TEXT,
							text: 'Something went wrong'
						},
					});
				});
			},
			generateFileHash(file, done) {
				let hasher = require('../lib/hash');
				hasher(file, (err, hash) => {
					return done(err, hash);
				});
			},
			addMessage: function(message) {
				this.messages.push(message);
				this.scrollDown();
			},
			showSummary: function() {
				//show order summary before transmitting transaction
				this.showGasEstimate(this.proof.hash, this.proof.description, this.proof.ipfsHash);
			},
			showGasEstimate: function(textToProof, comment, ipfsHash) {
				console.log("showGasEstimate", textToProof, comment, ipfsHash);
				if (!ipfsHash) {
					ipfsHash = '';
				}
				if (!comment) {
					comment = '';
				}
				let contract = window.globalContract;
				if (contract) {
					window.globalWeb3.eth.getAccounts((err, accounts) => {
						if (err || accounts.lenth === 0) {
							//TODO: error handling
						} else {
							contract.notarize.estimateGas(textToProof, comment, ipfsHash, {from : accounts[0]}, (err, estimate) => {
								console.log("showGasEstimate", err, estimate);
								if (!err) {
									let gasPriceEth = this.$store.state.gasPrice / 1000000000;
									let ethtimate = gasPriceEth * estimate;
									this.addMessageDelayed({
										sender: MessageSenderEnum.APP,
										body: {
											type: MessageBodyTypeEnum.TEXT,
											text: 'The transaction will use approximately ' + estimate + ' gas (' + ethtimate + ' eth)',
										},
									}, 1000, true);
								}
							});
						}
					});
				}
			},
			checkRequirements: function () {
				this.showti = true;
				if (window.globalWeb3 && this.$store.state.identity.address && this.$store.state.identity.balance > 0 && this.$store.state.identity.tokenBalance > 0) {
					return this.machine.transition('welcome');
				} else {
					//delay the check because of slow initialisation
					setTimeout(() => {
						//	check web3
						if (!window.globalWeb3) {
							return this.machine.transition('noWeb3');
						}
						// check unlocked
						if (this.$store.state.identity.address == null) {
							return this.machine.transition('notUnlocked');
						}
						// check ether balance TODO: get real balance
						if (this.$store.state.identity.balance <= 0) {
							return this.machine.transition('noEther');
						}
						// check token balance
						if (this.$store.state.identity.tokenBalance <= 0) {
							return this.machine.transition('noToken');
						}
						return this.machine.transition('welcome');
					}, 1300);
				}
			},
			checkManualInput() {
				let textToCheck = this.proof.hash;
				let regexp = /^[A-Fa-f0-9]{64}$/;
				if (regexp.test(textToCheck)) {
					this.machine.transition('name');
				} else {
					this.addMessageDelayed({
						sender: MessageSenderEnum.APP,
						body: {
							type: MessageBodyTypeEnum.TEXT,
							text: 'This is not a valid sha256 hash.',
						},
					}, 1000, true);
					this.proof.hash = null;
					this.machine.transition('proofByString');
				}
			},
			clearProof: function() {
				this.proof.hash = null;
				this.proof.description = null;
				this.proof.ipfsHash = null;
				this.proof.txId = null;
				this.proof.dataUrl = null;
			},
			openFilePicker: function() {
				this.$refs.fileButton.click();
			},
			showProofList: function() {
				this.$router.push({ path: '/proofs' });
			},
			getImageDataUrl: function(file, done) {
				if (file) {
					var reader = new FileReader();

					reader.onload = function (e) {
						return done(null, e.target.result);
					}

					reader.readAsDataURL(file);
				} else {
					return done(null, null);
				}
			}
		},
		mounted: function() {
			this.machine.on("transition", data => {
				let fromState = data.fromState;
				let toState = data.toState;
				console.log("we just transitioned from " + fromState + " to " + toState);
				let questionText = this.machine.getCurrentQuestion().getQuestionText();
				if (questionText && questionText != '') {
					this.showQuestionDelayed(questionText)
				}
			});

			this.machine.on("startProof", () => {
				console.log('startProof');
				let text = this.proof.hash;
				let comment = this.proof.description;
				let ipfsHash = this.proof.ipfsHash ? this.proof.ipfsHash : '';
				this.startProof(text, comment, ipfsHash);
			});

			this.machine.on("showFileUpload", (showFileUpload) => {
				console.log('showFileUpload');
				this.showFileUpload = showFileUpload;
			});

			this.machine.on('openFilePicker', () => {
				console.log('openFilePicker');
				this.openFilePicker();
			});

			this.machine.on('startUpload', () => {
				console.log('startUpload');
				this.startUpload();
			})

			this.machine.on("showFreetext", (showFreetext) => {
				console.log('showFreetext');
				this.showFreetext = showFreetext;
			});

			this.machine.on("proofDescriptionGiven", (givenDescription) => {
				console.log('proofDescriptionGiven');
				this.proof.description = givenDescription;
			});

			this.machine.on("showSummary", () => {
				this.showSummary();
			});

			this.machine.on("clearProof", () => {
				this.clearProof();
			});

			this.machine.on("checkRequirements", () => {
				this.checkRequirements();
			});

			this.machine.on('proofTextGiven', (givenText) => {
				this.proof.hash = givenText;
			});

			this.machine.on('showExistingProof', () => {
				this.showExistingProof();
			});

			this.machine.on('showProofList', () => {
				this.showProofList();
			});

			this.machine.on('invalidState', (data) => {
				console.log('invalidState', data);
			});

			if (this.contractReady) {
				this.machine.setAnswer('go');
			}
		},
		watch: {
			contractReady: function() {
				this.machine.setAnswer('go');
			}
		}
	}
