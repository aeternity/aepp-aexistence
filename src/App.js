import Topbar from './components/Topbar.vue'
import Web3 from 'web3'
export default {
	name: 'app',
	computed : {
		appClass : function() {
			return this.$store.state.appClass;
		},
		contractReady: function() {
			return this.$store.state.contractReady;
		}
	},
	components : {
		Topbar
	},
	methods: {
		loadAllProofs: function() {
			if (window.globalContract) {
				window.globalContract.getProofsByOwner(this.$store.state.identity.address, (err, hashes) => {
					if (!err) {
						for (let hash of hashes) {
							window.globalContract.getProofByHash(hash, (err, rawProof) => {
								let data = {
									image: 'http://localhost:3000/uploads/' + rawProof[5],
									title: rawProof[4],
									fileSha256: rawProof[5],
									created : rawProof[2],
									confirmations : 0,
									owner: rawProof[0],
									contract: this.$store.state.contractAddress,
									block: rawProof[3],
								};
								this.$store.commit('addProof', data);
							});
						}
					}
				});
			}
		},
		changeUser: function(address) {
			this.$store.commit('setAccount', address);
			this.$store.commit('setName', address.substr(0, 6));
			this.$store.commit('clearProofs');
			this.loadAllProofs();
		},
		setAcountInterval: function(web3) {
			setInterval(() => {
				if (web3) {
					let address = web3.eth.accounts[0];
					if (address) {
						let currentAddress = this.$store.state.identity.address;
						if (address != currentAddress) {
							console.log('address changed');
							this.changeUser(address);
						}

						web3.eth.getBalance(address, (err, balance) => {
							let readable = parseFloat(web3.fromWei(balance.toString(10), 'ether')).toFixed(3);
							console.log(err, readable);
							this.$store.commit('setBalance', readable);
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
				window.globalWeb3 = web3;

				this.initContract(web3);

				this.setAcountInterval(web3);
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
			PoEContract.at(this.$store.state.contractAddress, (err, contract) => {
				window.globalContract = contract;
				this.$store.commit('setContractReady', true);
				// app.loadAllProofs();
			});
		}
	},
	mounted: function() {
		console.log('mounted');
		window.addEventListener('load', () => {
			this.initWeb3();
		});
	},
	watch: {
		contractReady: function(val) {
			if (val === true) {
				this.loadAllProofs();
			}
		}
	}
}
