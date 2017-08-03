/* global Vue */

(function(){

	const Intro = { template: '#intro' };

	const Proof = {
		template : '#proof',
		props : [
			'proof'
		]
	}

	const Proofs = {
		template : '#proofs',
		components : {
			'proof' : Proof,
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
		computed : {
			identity : function() {
				return this.$store.state.identity;
			}
		},
		data : function() {
			return {};
		},
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
		data : function() {
			return {
				messages : [
					{
						sender : MessageSenderEnum.APP,
						body : {
							type : MessageBodyTypeEnum.TEXT,
							text :	"How about creating your first proof. You can 'proof' a pictute, file or conversation.",
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
							image : 'image.jpg'
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
				]
			}
		},
		components: {
			'speech' : Speech,
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
			'menu-entry': MenuEntry
		},
		data : function() {
			return {
				navopen : false,
				entris : [
					{
						label : 'My Proofs',
						link : '/proofs',
					},
					{
						label : 'Create a Proof',
						link : '/new',
					},
					{
						label : 'Shared with me',
						link : '/new',
					},
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
				this.navopen = false;
			}
		},
		methods : {
			toggleopen : function() {
				this.navopen = !this.navopen;
			}
		},
	}

	const Camera = {
		template: '#camera',
	}
	const store = new Vuex.Store({
		state: {
			title : '',
			proofs : [
				{
					title : 'Rental car damage',
					created : '14.05.2017',
					image : 'img/image.jpg',
					confirmations : 9
				}
			],
			identity : {
				avatar: "img/avatar-1.jpg",
				balance : 5,
				name : 'Joan',
				address : '0x7D154..',
			}
		},
		mutations: {
			title : function(state, newtitle) {
				state.title = newtitle;
			}
		}
	});

	const routes = [
		{ path: '/', component: Intro, meta : {title : 'Welcome'}},
		{ path: '/intro', component: Intro, meta : {title : 'Title'}},
		{ path: '/home', component: Home, meta : {title : 'Title'}},
		{ path: '/new', component: New, meta : {title : 'Create Proof'}},
		{ path: '/camera', component: Camera, meta : {title : 'Title'}},
		{ path: '/proofs', component: Proofs, meta : {title : 'Your Proofs'}},
	];

	const router = new VueRouter({
		routes: routes
	});
	router.beforeEach((to, from, next) => {
		document.title = to.meta.title;
		store.commit('title', to.meta.title);
		next();
	})

	const app = new Vue({
		el: '#app',
		store,
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
