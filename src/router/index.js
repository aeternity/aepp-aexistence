import Vue from 'vue'
import Router from 'vue-router'

import Intro from '@/components/Intro.vue'
import Home from '@/components/Home.vue'
import Chat from '@/components/Chat.vue'
import Camera from '@/components/Camera.vue'
import ProofsList from '@/components/ProofsList.vue'
import Proof from '@/components/Proof.vue'

Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '/',
			component: Intro,
			meta: {
				title: 'Welcome',
				appClass: 'welcome'
			}
		},
		{ path: '/home',
			component: Home,
			meta: {
				title: 'Æxistence',
				appClass: 'home'
			}},
		{ path: '/chat',
			component: Chat,
			meta: {
				title: 'Create Proof',
				appClass: 'new'
			}},
		{ path: '/camera',
			component: Camera,
			meta: {
				title: 'Camera',
				appClass: 'camera'
			}},
		{ path: '/proofs',
			component: ProofsList,
			meta: {
				title: 'Your Proofs',
				appClass: 'proofs'
			}},
		{ path: '/proofs/:id',
			component: Proof,
			meta: {
				title: 'Proof Details',
				appClass: 'proof'
			}}
	]
})
