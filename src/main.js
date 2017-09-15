/* global Vue */

const machine = require('./machine');

let globalWeb3 = null;
let globalContract = null;

(function(){
	const helperMixin = Vue.mixin({
		methods: {
			readableTimestamp: function(timestamp) {
				if (timestamp) {
					let momentTime = moment.unix(timestamp.toString());
					return momentTime.format("YYYY-MM-DD HH:mm");
				} else {
					return '';
				}
			},
			etherscanLink: function(value, type) {
				//type tx, address, block
				let baseurl = "https://ropsten.etherscan.io/";
				baseurl += type;
				baseurl += '/';
				baseurl += value;
				return baseurl;
			}
		}
	});

	const Intro = { template: '#intro' };

	const Camera = {
		template: '#camera',
		props : [
			'show'
		],
		data : function() {
			return {
				//show : false,
			};
		},
		methods : {
			close : function() {
				this.$emit('picture');
			}
		}
	}

	const Proof = {
		template : '#proof',
		data : function() {
			return {
				cssClass : {
					image : {
						fullscreen : false,
					}
				},
				rawProof: null
			}
		},
		mixins: [
			helperMixin
		],
		computed : {
			hash: function() {
				return this.$route.params.id;
			},
			contractReady: function() {
				return store.state.contractReady;
			},
			proof : function() {
				let hash = this.$route.params.id;
				let data = {
					image: '/img/uploads/' + hash,
					title: '?',
					fileSha256: hash,
					created : null,
					verified : null,
					confirmations : 0,
					contract: '',
					owner: '',
					block: ''
				};

				if (this.rawProof) {
					data.contract = store.state.contractAddress;
					data.owner = this.rawProof[0];
					data.created = this.rawProof[2];
					data.block = this.rawProof[3];
					data.title = this.rawProof[4];
				}

				return data;
			}
		},
		methods : {
			toggleImage : function() {
				this.cssClass.image.fullscreen =
					! this.cssClass.image.fullscreen;

			},
			getProof: function(text) {
				let contract = globalContract;
				if (contract) {
					contract.getProof(text, (err, proof) => {
						this.rawProof = proof;
						console.log('getProof', err, proof);
					});
				}
			},
		},
		mounted: function() {
			let app = this;
			if (app.contractReady) {
				app.getProof(app.hash);
			}
		},
		watch: {
			contractReady: function(val) {
				let app = this;
				if (val === true) {
					app.getProof(app.hash);
				}
			}
		}
	};

	const ProofsListEntry = {
		template : '#proofs-list-entry',
		mixins: [helperMixin],
		props : [
			'proof'
		]
	}

	const ProofsList = {
		template : '#proofs-list',
		components : {
			'proofsListEntry' : ProofsListEntry,
		},
		computed : {
			proofs : function() {
				return this.$store.state.proofs;
			}
		}
	};

	const Avatar = {
		template : '#avatar',
		props : [
			'image',
			'blockie'
		],
		computed : {
			style : function() {
				return {
					// backgroundImage: "url('"+this.image+"')",
					backgroundColor: '#d1d1d1'
				}
			}
		}
	};

	const Identity = {
		template: '#identity',
		components : {
			'avatar' : Avatar
		},
		data : function() {
			return {
				showPaymentUi : false
			};
		},
		computed : {
			identity : function() {
				return this.$store.state.identity;
			},
			collapsed : function() {
				return (!this.showPaymentUi) && this.$store.state.identityCollapsed;
			},
			paymentRequest : function() {
				return this.$store.state.identity.paymentRequest;
			},
			blockie: function() {
				return blockies.create();
			}
		},
		watch : {
			paymentRequest : function(req) {
				console.log(req);
				if(req) {
				this.showPaymentUi = true;
				} else {
					this.showPaymentUi = false;
				}
			}
		},
		methods: {
			toggle : function() {
				if(this.$store.state.appClass !== 'home') {
					this.$store.commit('identityCollapsed', !this.$store.state.identityCollapsed);
				}
			},
			pay : function() {
				store.dispatch('approvePayment');
				setTimeout(()=>{
					this.showPaymentUi = false;
				}, 200);
			},
			cancel : function() {
				store.dispatch('cancelPayment');
				this.showPaymentUi = false;
			}
		}
	};

	const Home = {
		template: '#home',
		components: {
			'identity' : Identity
		}
	};

	const MessageSenderEnum = {
		ME : 0,
		APP : 1,
	};

	const MessageBodyTypeEnum = {
		TEXT : 0,
		IMAGE : 1,
		PAYMENT : 2,
		LINK : 3,
	}

	const Speech = {
		template : '#speech',
		props : [
			'body',
			'sender'
		],
		computed : {
			thisclass : function() {
				return {
					'app' : this.sender === MessageSenderEnum.APP,
					'me' : this.sender === MessageSenderEnum.ME,
					'body-type-image ' : this.body.type === MessageBodyTypeEnum.IMAGE,
					'body-type-text' : this.body.type === MessageBodyTypeEnum.TEXT || this.body.type === MessageBodyTypeEnum.LINK,
					'speech': true,
				};
			},
			style : function() {
				return {
					backgroundImage: this.body.type === MessageBodyTypeEnum.IMAGE ? "url('img/"+this.body.image+"')" : null,
				};
			}
		}
	}

	const Chat = {
		template: '#chat',
		components: {
			'speech' : Speech,
			'camera' : Camera,
		},
		data: function() {
			return {
				machine: machine(),
				messages: [],
				showti : false,
				showresp : false,
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
			}
		},
		methods: {
			scrollDown : function() {
				setTimeout(function(){
					document.getElementsByClassName('conversation-container')[0].scrollTop = 100000000
				},100);
			},
			handleAnswer: function(givenAnswer) {
				this.addMessage({
					sender : MessageSenderEnum.ME,
					body : {
						type : MessageBodyTypeEnum.TEXT,
						text : givenAnswer,
					},
				});
				this.machine.setAnswer(givenAnswer);
			},
			handleFreetextInput: function() {
				this.handleAnswer(this.userInput);
				this.userInput = '';
			},
			showQuestionDelayed: function(text) {
				let app = this;
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
				let app = this;
				if (showThinkingBubble) {
					app.showti = true;
				}
				setTimeout(function() {
					if (showThinkingBubble) {
						app.showti = false;
					}
					app.addMessage(message);
				}, delay);
			},
			startProof: function(textToProof, comment) {
				let app = this;
				let contract = globalContract;
				if (contract) {
					async.waterfall([
						function(callback) {
							contract.hasProof(textToProof, function(err, hasProof) {
								if (hasProof) {
									app.addMessageDelayed({
										sender: MessageSenderEnum.APP,
										body: {
											type: MessageBodyTypeEnum.LINK,
											description: "This file has already been notarized",
											title: textToProof,
											url: router.resolve('/proofs/' + textToProof).href
										},
									}, 1000, true);
									app.machine.transition('clear');
									return callback(new Error('Already notarized'));
								} else {
									return callback(null);
								}
							});
						},
						function(callback) {
							contract.notarize.estimateGas(textToProof, comment, {}, (err, estimate) => {
								return callback(err, estimate);
							});
						},
						function(estimate, callback) {
							let transactionOptions = {
								gas: estimate + 1000
							};
							contract.notarize(textToProof, comment, transactionOptions, (err, txId) => {
								return callback(err, txId);
							});
						}
					], function(err, txId) {
						if (err) {
							app.machine.transition('transactionError');
						} else {
							app.proof.txId = txId;
							app.showTransactionId(txId);
							app.machine.transition('summary');
						}
					});
				}
			},
			showTransactionId: function(txId) {
				let app = this;
				app.addMessageDelayed({
					sender: MessageSenderEnum.APP,
					body: {
						type: MessageBodyTypeEnum.LINK,
						description: "This is the Transaction ID",
						title: txId,
						url: app.etherscanLink(txId, 'tx')
					},
				}, 1000, true);
			},
			onFileChange: function(event) {
				console.log('onFileChange', event.target.files);
				this.fileUploadFormData.set('file', event.target.files[0]);

				this.sendFile();
			},
			preventSubmit: function(event) {
				event.preventDefault();
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
						sender : MessageSenderEnum.ME,
						body : {
							type : MessageBodyTypeEnum.IMAGE,
							image : 'uploads/' + hash
						}
					});
					this.machine.setAnswer('pay');
				}, response => {
					console.log('nay', response);
					this.addMessage({
						sender : MessageSenderEnum.APP,
						body : {
							type : MessageBodyTypeEnum.TEXT,
							text : 'Something went wrong D: ',
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
					sender : MessageSenderEnum.APP,
					body : {
						type : MessageBodyTypeEnum.IMAGE,
						image : '/uploads/' + this.proof.hash,
						link : '/proofs/' + this.proof.hash,
						linktext : this.proof.description
					},
				}, 1000, true);
			},
			showGasEstimate: function(textToProof, comment) {
				let app = this;
				let contract = globalContract;
				if (contract) {
					contract.notarize.estimateGas(textToProof, comment, {}, (err, estimate) => {
						let ethtimate = 0.00000002 * estimate;
						if (!err) {
							app.addMessageDelayed({
								sender : MessageSenderEnum.APP,
								body : {
									type : MessageBodyTypeEnum.TEXT,
									text : 'The transaction will use approximately ' + estimate + ' gas (' + ethtimate + ' eth)',
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
			let app = this;

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
				let text = app.proof.hash;
				let comment = app.proof.description;
				app.startProof(text, comment);
			});

			this.machine.on("showFileUpload", (showFileUpload) => {
				console.log('showFileUpload');
				app.showFileUpload = showFileUpload;
			});

			this.machine.on("showFreetext", (showFreetext) => {
				console.log('showFreetext');
				app.showFreetext = showFreetext;
			});

			this.machine.on("proofDescriptionGiven", (givenDescription) => {
				console.log('proofDescriptionGiven');
				app.proof.description = givenDescription;
			});

			this.machine.on("showSummary", () => {
				app.showSummary();
			});

			this.machine.on("showGasEstimate", () => {
				app.showGasEstimate(app.proof.hash, app.proof.description);
			});

			this.machine.on("clearProof", () => {
				app.clearProof();
			});

			this.machine.setAnswer('go');

			setTimeout(function() {
				let web3 = globalWeb3;
				let contract = globalContract;
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
	};

	const MenuEntry = {
		template : '#menu-entry',
		props : [
			'link',
			'label'
		]
	}
	const Topbar = {
		template: '#topbar',
		components : {
			'avatar': Avatar,
			'menu-entry': MenuEntry,
			'identity' : Identity
		},
		data : function() {
			return {
				navopen : false,
				showAdd : true,
				showBurger : true,
				showBack : false,
				entris : [
					{
						label : 'My Proofs',
						link : '/proofs',
					},
					{
						label : 'Create a Proof',
						link : '/chat',
					},
					//{
						//label : 'Shared with me',
						//link : '/new',
					//},
					//{
						//label : 'My Proofs',
					//},
				]
			}
		},
		computed : {
			thisclass : function() {
				return {
					'topbar' : true,
					'open' : this.navopen,
				};
			},
			identity : function() {
				return this.$store.state.identity;
			},
			title : function() {
				return this.$store.state.title;
			}
		},
		watch: {
			'$route' : function(to, from) {
				var proofDetail = null !== to.path.match(/^\/proofs\/\d+/);

				this.showAdd = to.path !== '/chat';
				this.showBurger = !proofDetail;
				this.showBack = proofDetail;
				this.navopen = false;
			}
		},
		methods : {
			toggleopen : function() {
				this.navopen = !this.navopen;
			}
		},
	}

	const store = new Vuex.Store({
		state: {
			title : '',
			appClass : '',
			proofs : [
			],
			identity : {
				avatar: "img/avatar-1.jpg",
				balance : '0.00',
				name : '',
				address : null,
				paymentRequest : null,
				approvedPayments: [],
				declinedPayments: [],
			},
			identityCollapsed : false,
			hasWeb3: false,
			contractReady: false,
			contractAddress: '0xcbaa1afa8bd967eb093b8da83c0cad905a82e905'
		},
		getters: {
			getProofById: (state, getters) => (id) => state.proofs.find(proof => proof.id == id)
		},
		mutations: {
			title : function(state, newtitle) {
				state.title = newtitle;
			},
			addProof : function(state, newProof) {
				state.proofs.push(newProof);
				state.proofs.sort((a, b) => {
					return b.created - a.created;
				});
			},
			appClass : function(state, newClass) {
				state.appClass = newClass;
			},
			identityCollapsed : function(state, collapse) {
				state.identityCollapsed = collapse;
			},
			addPaymentRequest : function(state, payment) {
				state.identity.paymentRequest = payment;
			},
			pay : function(state) {
				var paymentRequest = state.identity.paymentRequest;
				state.identity.balance = (state.identity.balance - paymentRequest.amount).toFixed(2);
				state.identity.approvedPayments.push(paymentRequest);
				paymentRequest.success();
			},
			cancel : function(state) {
				state.identity.paymentRequest.canceled();
				state.identity.paymentRequest = null;
			},
			setHasWeb3: function(state, hasWeb3) {
				state.hasWeb3 = hasWeb3;
			},
			setContractReady: function(state, contractReady) {
				state.contractReady = contractReady;
			},
			setAccount: function(state, account) {
				state.identity.address= account;
			},
			setBalance: function(state, balance) {
				state.identity.balance = balance;
			},
			setName: function(state, name) {
				state.identity.name = name;
			},
			clearProofs: function(state) {
				state.proofs = [];
			}
		},
		actions : {
			paymentRequest : function(context, payment) {
				context.commit('addPaymentRequest', payment);
			},
			approvePayment : function(context) {
				context.commit('pay');
			},
			cancelPayment : function(context) {
				context.commit('cancel');
			}
		}
	});

	const routes = [
		{ path: '/', component: Intro, meta : {
			title : 'Welcome',
			appClass : 'welcome'
		}},
		{ path: '/home', component: Home, meta : {
			title : 'Æxistence',
			appClass : 'home'
		}},
		{ path: '/chat', component: Chat, meta : {
			title : 'Create Proof',
			appClass : 'new'
		}},
		{ path: '/camera', component: Camera, meta : {
			title : 'Camera',
			appClass : 'camera'
		}},
		{ path: '/proofs', component: ProofsList, meta : {
			title : 'Your Proofs',
			appClass : 'proofs'
		}},
		{ path: '/proofs/:id', component: Proof, meta : {
			title : 'Proof Details',
			appClass : 'proof'
		}},
	];

	const router = new VueRouter({
		routes: routes
	});

	router.beforeEach((to, from, next) => {
		document.title = to.meta.title;
		store.commit('title', to.meta.title);
		store.commit('appClass', to.meta.appClass);
		if(to.meta.appClass === 'home') {
			store.commit('identityCollapsed', false);
		} else {
			store.commit('identityCollapsed', true);
		}
		next();
	})

	const app = new Vue({
		el: '#app',
		store,
		computed : {
			appClass : function() {
				return this.$store.state.appClass;
			},
			contractReady: function() {
				return store.state.contractReady;
			}
		},
		components : {
			'topbar' : Topbar
		},
		router,
		methods: {
			loadAllProofs: function() {
				if (globalContract) {
					globalContract.getProofsByOwner(store.state.identity.address, function(err, hashes) {
						if (!err) {
							for (let hash of hashes) {
								globalContract.getProofByHash(hash, function(err, rawProof) {
									let data = {
										image: '/img/uploads/' + rawProof[5],
										title: rawProof[4],
										fileSha256: rawProof[5],
										created : rawProof[2],
										confirmations : 0,
										owner: rawProof[0],
										contract: store.state.contractAddress,
										block: rawProof[3],
									};
									store.commit('addProof', data);
								});
							}
						}
					});
				}
			},
			changeUser: function(address) {
				store.commit('setAccount', address);
				store.commit('setName', address.substr(0, 6));
				store.commit('clearProofs');
				this.loadAllProofs();
			},
			setAcountInterval: function(web3) {
				let app = this;
				setInterval(function() {
					if (web3) {
						let address = web3.eth.accounts[0];
						if (address) {
							let currentAddress = store.state.identity.address;
							if (address != currentAddress) {
								console.log('address changed');
								app.changeUser(address);
							}

							web3.eth.getBalance(address, (err, balance) => {
								let readable = parseFloat(web3.fromWei(balance.toString(10), 'ether')).toFixed(3);
								console.log(err, readable);
								store.commit('setBalance', readable);
							});
						}
					}
				}, 1000);
			},
			initWeb3: function() {
				if (typeof web3 !== 'undefined') {
					web3 = new Web3(web3.currentProvider);
				} else {
					web3 = null;
					// web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
				}
				if (web3) {
					globalWeb3 = web3;

					app.initContract(web3);

					app.setAcountInterval(web3);
				}
			},
			initContract: function(web) {
				let abi = [{
					"constant": true,
					"inputs": [{
						"name": "owner",
						"type": "address"
					}],
					"name": "getProofsByOwner",
					"outputs": [{
						"name": "",
						"type": "bytes32[]"
					}],
					"payable": false,
					"type": "function"
				},
				{
					"constant": true,
					"inputs": [{
						"name": "document",
						"type": "string"
					}],
					"name": "calculateHash",
					"outputs": [{
						"name": "",
						"type": "bytes32"
					}],
					"payable": false,
					"type": "function"
				},
				{
					"constant": true,
					"inputs": [{
						"name": "hash",
						"type": "bytes32"
					}],
					"name": "getProofByHash",
					"outputs": [{
							"name": "owner",
							"type": "address"
						},
						{
							"name": "proofHash",
							"type": "bytes32"
						},
						{
							"name": "timestamp",
							"type": "uint256"
						},
						{
							"name": "proofBlock",
							"type": "uint256"
						},
						{
							"name": "comment",
							"type": "string"
						},
						{
							"name": "storedDocument",
							"type": "string"
						}
					],
					"payable": false,
					"type": "function"
				},
				{
					"constant": true,
					"inputs": [{
						"name": "document",
						"type": "string"
					}],
					"name": "getProof",
					"outputs": [{
							"name": "owner",
							"type": "address"
						},
						{
							"name": "proofHash",
							"type": "bytes32"
						},
						{
							"name": "timestamp",
							"type": "uint256"
						},
						{
							"name": "proofBlock",
							"type": "uint256"
						},
						{
							"name": "comment",
							"type": "string"
						},
						{
							"name": "storedDocument",
							"type": "string"
						}
					],
					"payable": false,
					"type": "function"
				},
				{
					"constant": false,
					"inputs": [{
							"name": "document",
							"type": "string"
						},
						{
							"name": "comment",
							"type": "string"
						}
					],
					"name": "notarize",
					"outputs": [],
					"payable": false,
					"type": "function"
				},
				{
					"constant": true,
					"inputs": [{
						"name": "document",
						"type": "string"
					}],
					"name": "hasProof",
					"outputs": [{
						"name": "",
						"type": "bool"
					}],
					"payable": false,
					"type": "function"
				}];
				let PoEContract = web3.eth.contract(abi);
				PoEContract.at(store.state.contractAddress, function (err, contract) {
					globalContract = contract;
					store.commit('setContractReady', true);
					// app.loadAllProofs();
				});
			}
		},
		mounted: function() {
			let app = this;
			console.log('mounted');
			window.addEventListener('load', function() {
				app.initWeb3();
			});
		},
		watch: {
			contractReady: function(val) {
				if (val === true) {
					app.loadAllProofs();
				}
			}
		}
	});
})();

var mySwiper = new Swiper ('.swiper-container', {
	pagination: '.swiper-pagination',
	nextButton: '.next',
});
