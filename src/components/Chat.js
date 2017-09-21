import machine from './../machine.js'
import Speech from './Speech.vue'
import waterfall from 'async/waterfall'

import helperMixin from '../mixins/helper.js';

import MessageSenderEnum from '../MessageSenderEnum.js'
import MessageBodyTypeEnum from '../MessageBodyTypeEnum.js'

export default {
		name: 'chat',
		components: {
			'speech': Speech
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
					description: '',
					txId: null
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
				this.addMessage({
					sender: MessageSenderEnum.ME,
					body: {
						type: MessageBodyTypeEnum.TEXT,
						text: givenAnswer,
					},
				});
				this.machine.setAnswer(givenAnswer);
			},
			handleFreetextInput: function() {
				this.handleAnswer(this.userInput);
				this.userInput = '';
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
			startProof: function(textToProof, comment) {
				let contract = window.globalContract;
				if (!contract) {
					return
				}

				waterfall([
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
						contract.notarize.estimateGas(textToProof, comment, {}, (err, estimate) => {
							return callback(err, estimate);
						});
					},
					(estimate, callback) => {
						let transactionOptions = {
							from : window.globalWeb3.eth.accounts[0],
							gas: estimate
						};
						contract.notarize(textToProof, comment, transactionOptions, (err, txId) => {
							return callback(err, txId);
						});
					}
				], (err, txId) => {
					if (err) {
						this.machine.transition('transactionError');
					} else {
						this.proof.txId = txId;
						this.showTransactionId(txId);
						this.machine.transition('summary');
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

				if (this.machine.currentState == 'checkPicture') {
					this.checkImage();
				} else {
					this.sendFile();
				}
			},
			preventSubmit: function(event) {
				event.preventDefault();
			},
			checkImage: function() {
				this.$http.post('/hash', this.fileUploadFormData).then(response => {
					console.log('yay', response);
					let hash = response.body.hash;
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
				}, response => {
					console.log('nay', response);
					this.addMessage({
						sender: MessageSenderEnum.APP,
						body: {
							type: MessageBodyTypeEnum.TEXT,
							text: 'Something went wrong D: ',
						},
					});
				});
			},
			sendFile: function(event) {
				if (event) {
					event.preventDefault();
				}

				this.$http.post('/upload', this.fileUploadFormData).then(response => {
					console.log('yay', response);
					let hash = response.body.hash;
					this.proof.hash = hash;
					this.addMessage({
						sender: MessageSenderEnum.ME,
						body: {
							type: MessageBodyTypeEnum.IMAGE,
							image: '/uploads/' + hash
						}
					});
					this.machine.setAnswer('pay');
				}, response => {
					console.log('nay', response);
					this.addMessage({
						sender: MessageSenderEnum.APP,
						body: {
							type: MessageBodyTypeEnum.TEXT,
							text: 'Something went wrong D: ',
						},
					});
				});
			},
			addMessage: function(message) {
				this.messages.push(message);
				this.scrollDown();
			},
			showSummary: function() {
				this.addMessageDelayed({
					sender: MessageSenderEnum.APP,
					body: {
						type: MessageBodyTypeEnum.IMAGE,
						image: '/uploads/' + this.proof.hash,
						link: '/proofs/' + this.proof.hash,
						linktext: this.proof.description
					},
				}, 1000, true);
			},
			showGasEstimate: function(textToProof, comment) {
				let contract = window.globalContract;
				if (contract) {
					contract.notarize.estimateGas(textToProof, comment, {}, (err, estimate) => {
						let ethtimate = 0.000000021 * estimate;
						if (!err) {
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
			},
			clearProof: function() {
				this.proof.hash = null;
				this.proof.description = '';
				this.proof.txId = null;
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
				this.startProof(text, comment);
			});

			this.machine.on("showFileUpload", (showFileUpload) => {
				console.log('showFileUpload');
				this.showFileUpload = showFileUpload;
			});

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

			this.machine.on("showGasEstimate", () => {
				this.showGasEstimate(this.proof.hash, this.proof.description);
			});

			this.machine.on("clearProof", () => {
				this.clearProof();
			});

			this.machine.setAnswer('go');

			setTimeout(function() {
				let web3 = window.globalWeb3;
				let contract = window.globalContract;
				if (web3) {
					let account = web3.eth.accounts[0];
					console.log('web3', web3, contract);
					// if (account) {
					// 	let transaction = {
					// 		gas: 200000
					// 	};
					// 	contract.notarize("hurr", transaction, (err, data) => {
					// 		console.log(err, data);
					// 	});
					// }
					// contract.checkDocument(web3.fromAscii('lol', 32), (err, data) => {
					// 	console.log(err, data);
					// });
					//
				} else {
					console.log('no web3');
				}
			}, 2000);

		}
	}
