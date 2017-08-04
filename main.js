/* global Vue */

(function(){
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
				}
			}
		},
		computed : {
			proof : function() {
				return this.$store.getters.getProofById( this.$route.params.id );
			}
		},
		methods : {
			toggleImage : function() {
				this.cssClass.image.fullscreen =
					! this.cssClass.image.fullscreen;

			}
		}
	};
	const ProofsListEntry = {
		template : '#proofs-list-entry',
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
			'image'
		],
		computed : {
			style : function() {
				return {
					backgroundImage: "url('"+this.image+"')"
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
					'body-type-text' : this.body.type === MessageBodyTypeEnum.TEXT,
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

	const New = {
		template: '#new',
		components: {
			'speech' : Speech,
			'camera' : Camera,
		},
		data : function() {
			return {
				proof : {
					created : null,
					verified : null,
					title : '',
					image : 'img/image.jpg',
					confirmations : 0,
					contract: '0x8a9c4bb2f2...',
					block: '1133777',
					fileSha256: 'd91ef0a24a9eb1c1...',
					fileType: 'image/jpeg',
					fileSize: '1.4 Mb',
					fileLocation : 'Dropbox'
				},
				showCamera : false,
				showti : true,
				showresp : false,
				userInput : 'rental car damage',
				i : 0,
				messages : [
				],
				f : [
					{
						sender : MessageSenderEnum.APP,
						body : {
							type : MessageBodyTypeEnum.TEXT,
							text :	"How about creating your first proof. You can 'proof' a picture or any other file.",
						},
					},
					{
						sender : MessageSenderEnum.ME,
						body : {
							type : MessageBodyTypeEnum.TEXT,
							text : "Camera",
						},
					},
					{
						sender : MessageSenderEnum.ME,
						body : {
							type : MessageBodyTypeEnum.IMAGE,
							image : 'image.jpg',
							link : false
						},
					},
					{
						sender : MessageSenderEnum.APP,
						body : {
							type : MessageBodyTypeEnum.TEXT,
							text :	"OK! Now you should give your proof a reasonable name. Try to explain what it is!",
						},
					},
					{
						sender : MessageSenderEnum.ME,
						body : {
							type : MessageBodyTypeEnum.TEXT,
							text : "rental car damage",
						},
					},
					{
						sender : MessageSenderEnum.APP,
						body : {
							type : MessageBodyTypeEnum.TEXT,
							text : "Got that! This proof will cost 0.1 AET.",
						},
					},
					{
						sender : MessageSenderEnum.ME,
						body : {
							type : MessageBodyTypeEnum.TEXT,
							text : "Yes, I pay 0.1 AET",
						},
					},
					{
						sender : MessageSenderEnum.APP,
						body : {
							type : MessageBodyTypeEnum.TEXT,
							text : "Success! Your proof has been created.",
						},
					},
					{
						sender : MessageSenderEnum.APP,
						body : {
							type : MessageBodyTypeEnum.IMAGE,
							image : 'image.jpg',
							link : '/proofs/1',
							linktext : 'rental car damage'
						},
					},
				]
			}
		},
		watch : {
			i : function(val) {
				if(val == 2) {
					this.showCamera = true;
				}
			}
		},
		methods : {
			scrollDown : function() {
				setTimeout(function(){
					document.getElementsByClassName('conversation-container')[0].scrollTop = 100000000
				},100);
			},
			pictureTaken : function() {
				this.showCamera = false;
				this.bot(1);
			},
			bot : function(inc) {
				this.showti = true;
				setTimeout(()=>{
					this.showti = false;
					for (var x = 0; x < inc; x++) {
						if(this.i === 8) {
							var lastp = store.state.proofs[store.state.proofs.length - 1];
							this.f[this.i].body.link = '/proofs/'+lastp.id;
							this.f[this.i].body.linktext = lastp.title;
						}
						this.messages.push(this.f[this.i++]);
					}
					this.showresp = true;
					this.scrollDown();
				},1000);
			},
			user : function(inc) {
				this.showresp = false;
				for (var x = 0; x < inc; x++) {
					if(this.i === 4) {
						this.f[this.i].body.text = this.userInput;
					}
					this.messages.push(this.f[this.i++]);
					if(this.i == 7) {
						store.dispatch('paymentRequest', {
							success : () => {
								this.paymentSuccess();
							},
							amount : 0.1
						});
						this.scrollDown();
						return;
					}
				}
				this.scrollDown();
				this.bot(1);
			},
			paymentSuccess : function() {

				var today = new Date();
				var dd = today.getDate();
				var mm = today.getMonth()+1; //January is 0!
				if(dd<10){
					dd='0'+dd;
				}
				if(mm<10){
					mm='0'+mm;
				}
				var yyyy = today.getFullYear();
				var today = dd+'.'+mm+'.'+yyyy;

				this.proof.created = today;
				this.proof.verified = today;
				this.proof.title = this.userInput;
				this.proof.confirmations = Math.round(Math.random() * 10) + 1;

				store.commit('addProof', this.proof);
				this.bot(2);

			}
		},
		mounted : function(){
			setTimeout(()=>{
				this.bot(1);
			},1000);
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
						link : '/new',
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

				this.showAdd = to.path !== '/new';
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
				balance : '5.00',
				name : 'Joan',
				address : '0x7D154..',
				paymentRequest : null,
				approvedPayments: [],
				declinedPayments: [],
			},
			identityCollapsed : false
		},
		getters: {
			getProofById: (state, getters) => (id) => state.proofs.find(proof => proof.id == id)
		},
		mutations: {
			title : function(state, newtitle) {
				state.title = newtitle;
			},
			addProof : function(state, newProof) {
				newProof.id = state.proofs.length+1;
				state.proofs.push(newProof);
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
			}
		},
		actions : {
			paymentRequest : function(context, payment) {
				context.commit('addPaymentRequest', payment);
			},
			approvePayment : function(context) {
				context.commit('pay');
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
		{ path: '/new', component: New, meta : {
			title : 'Create Proof',
			appClass : 'new'
		}},
		{ path: '/camera', component: Camera, meta : {
			title : 'Camer',
			appClass : 'camera'
		}},
		{ path: '/proofs', component: ProofsList, meta : {
			title : 'Your Proofs',
			appClass : 'proofs'
		}},
		{ path: '/proofs/:id', component: Proof, meta : {
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
			}
		},
		components : {
			'topbar' : Topbar
		},
		router
	});
})();

var mySwiper = new Swiper ('.swiper-container', {
	pagination: '.swiper-pagination',
	nextButton: '.next',
});
