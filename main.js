/*
 global Vue
 */
(function(){
	const Intro = { template: '#intro' };
	const Identity = {
		template: '#identity',
		data : function() {
			return {
				avatar: "img/avatar-1.jpg",
				balance : 5,
				name : 'Joan',
				address : '0x7D154..',
			}
		},
		computed : {
			style : function() {
				return {
					backgroundImage: "url('"+this.avatar+"')"
				}
			}
		}
	};

	const Home = {
		template: '#home',
		components: {
			'identity' : Identity
		}
	};

	const routes = [
		{ path: '/', component: Intro },
		{ path: '/intro', component: Intro },
		{ path: '/home', component: Home },
	];

	const router = new VueRouter({
		routes: routes
	});

	const app = new Vue({
		router
	}).$mount('#app');

})();

var mySwiper = new Swiper ('.swiper-container', {
	pagination: '.swiper-pagination',
	nextButton: '.next',
});
