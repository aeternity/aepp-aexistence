/* global Vue */

(function(){

	const Intro = { template: '#intro' };
	const Overview = {
		template : '#overview',
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
						link : '/overview',
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
				console.log(this.$store.state.count) // -> 1
			}
		},
	}

	const Camera = {
		template: '#camera',
	}
	const routes = [
		{ path: '/', component: Intro },
		{ path: '/intro', component: Intro },
		{ path: '/home', component: Home },
		{ path: '/new', component: New },
		{ path: '/camera', component: Camera },
		{ path: '/overview', component: Overview },
	];

	const router = new VueRouter({
		routes: routes
	});

	const store = new Vuex.Store({
		state: {
			count: 0,
			proofs : [
			],
			identity : {
				avatar: "img/avatar-1.jpg",
				balance : 5,
				name : 'Joan',
				address : '0x7D154..',
			}
		},
		mutations: {
			increment (state) {
				state.count++
			}
		}
	});

	store.commit('increment')
	console.log(store.state.count) // -> 1

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
