import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import router from './router'
import VueResource from 'vue-resource'

Vue.use(VueResource)
Vue.use(Vuex)

Vue.config.productionTip = false

const store = new Vuex.Store({
	state: {
		title: '',
		appClass: '',
		proofs: [
		],
		identity: {
			avatar: '/static/avatar-1.jpg',
			balance: '0.00',
			name: '',
			address: null,
			paymentRequest: null,
			approvedPayments: [],
			declinedPayments: []
		},
		identityCollapsed: true,
		hasWeb3: false,
		contractReady: false,
		// Ropsten
		// contractAddress: '0xcbaa1afa8bd967eb093b8da83c0cad905a82e905'
		// Kovan
		contractAddress: '0x4d987d358d66bbcf4f8f59cf0521b6138ee6cc3d'
	},
	getters: {
		getProofById: (state, getters) => (id) => state.proofs.find(proof => proof.id === id)
	},
	mutations: {
		title: function (state, newtitle) {
			state.title = newtitle
		},
		addProof: function (state, newProof) {
			state.proofs.push(newProof)
			state.proofs.sort((a, b) => {
				return b.created - a.created
			})
		},
		appClass: function (state, newClass) {
			state.appClass = newClass
		},
		identityCollapsed: function (state, collapse) {
			state.identityCollapsed = collapse
		},
		addPaymentRequest: function (state, payment) {
			state.identity.paymentRequest = payment
		},
		pay: function (state) {
			var paymentRequest = state.identity.paymentRequest
			state.identity.balance = (state.identity.balance - paymentRequest.amount).toFixed(2)
			state.identity.approvedPayments.push(paymentRequest)
			paymentRequest.success()
		},
		cancel: function (state) {
			state.identity.paymentRequest.canceled()
			state.identity.paymentRequest = null
		},
		setHasWeb3: function (state, hasWeb3) {
			state.hasWeb3 = hasWeb3
		},
		setContractReady: function (state, contractReady) {
			state.contractReady = contractReady
		},
		setAccount: function (state, account) {
			state.identity.address = account
		},
		setBalance: function (state, balance) {
			state.identity.balance = balance
		},
		setName: function (state, name) {
			state.identity.name = name
		},
		clearProofs: function (state) {
			state.proofs = []
		}
	},
	actions: {
		paymentRequest: function (context, payment) {
			context.commit('addPaymentRequest', payment)
		},
		approvePayment: function (context) {
			context.commit('pay')
		},
		cancelPayment: function (context) {
			context.commit('cancel')
		}
	}
})

/* eslint-disable no-new */
new Vue({
	el: '#app',
	store,
	router,
	render: h => h(App)
})
