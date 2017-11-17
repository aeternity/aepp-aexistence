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
			tokenBalance: 0,
			hasTokens: false,
			name: '',
			address: null,
			paymentRequest: null,
			approvedPayments: [],
			declinedPayments: []
		},
		transactions: {},
		identityCollapsed: true,
		hasWeb3: false,
		contractReady: false,
		// default gas price in wei
		gasPrice: 20,
		// Ropsten
		// contractAddress: '0xcbaa1afa8bd967eb093b8da83c0cad905a82e905'
		// Kovan
		contractAddress: '0x2801361d0e854d5a8ca5a53243720a227ef08182',
		tokenAddress: '0x35d8830ea35e6Df033eEdb6d5045334A4e34f9f9',
		hasParentWeb3: false,
		ipfs: {
			host: '207.154.212.173',
			port: 5002,
			protocol: 'http',
			imgBaseUrl: 'http://207.154.212.173/ipfs/'
		}
	},
	getters: {
		getProofById: (state, getters) => (id) => state.proofs.find(proof => proof.id === id),
		getTxByHash: (state, getters) => (hash) => {
			if (state.transactions[hash]) {
				return state.transactions[hash]
			}
			if (typeof (Storage) !== 'undefined') {
				let txId = localStorage.getItem('txFor_' + hash)
				if (txId) {
					return txId
				}
			}
			return null
		}
	},
	mutations: {
		title: function (state, newtitle) {
			state.title = newtitle
		},
		addProof: function (state, newProof) {
			// check if proof already in list
			let findIndex = state.proofs.findIndex((existingProof) => {
				return existingProof.fileSha256 === newProof.fileSha256
			})
			if (findIndex < 0) {
				state.proofs.push(newProof)
				state.proofs.sort((a, b) => {
					return b.created - a.created
				})
			}
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
		setHasTokens: function (state, hasTokens) {
			state.identity.hasTokens = hasTokens
		},
		setAccount: function (state, account) {
			state.identity.address = account
		},
		setBalance: function (state, balance) {
			state.identity.balance = balance
		},
		setTokenBalance: function (state, balance) {
			state.identity.tokenBalance = balance
		},
		setName: function (state, name) {
			state.identity.name = name
		},
		clearProofs: function (state) {
			state.proofs = []
		},
		addTransaction: function (state, options) {
			console.log('addTransaction', options)
			if (options.hash && options.txId) {
				state.transactions[options.hash] = options.txId
				if (typeof (Storage) !== 'undefined') {
					localStorage.setItem('txFor_' + options.hash, options.txId)
				}
			}
		},
		setHasParentWeb3: function (state, hasParentWeb3) {
			state.hasParentWeb3 = hasParentWeb3
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
