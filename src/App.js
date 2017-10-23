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
								console.log(rawProof);
								let data = {
									image: null,
									owner: rawProof[0],
									created : rawProof[1],
									block: rawProof[2],
									title: rawProof[3],
									ipfsHash: rawProof[4],
									fileSha256: rawProof[5],
									contract: this.$store.state.contractAddress,
								};
								if (rawProof[4]) {
									data.image = this.$store.state.apiBaseUrl + '/uploads/' + rawProof[4];
								}
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
					web3.eth.getAccounts((err, accounts) => {
						if (err) {
							console.log(err);
							return;
						} else if (accounts.length === 0) {
							console.log('no accounts found');
							return
						}
						let address = accounts[0];
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

							let tokenContract = window.globalTokenContract;
							if (tokenContract) {
								tokenContract.balanceOf(address, {}, (err, balance) => {
									let readable = web3.fromWei(balance.toString(10), 'ether');
									this.$store.commit('setTokenBalance', readable);
									this.$store.commit('setHasTokens', balance > 0);
								});
							}
						}
					})
				}
			}, 1000);
		},
		initWeb3: function() {
			let web3;
			if (typeof window.web3 !== 'undefined') { // Metamask
				web3 = new Web3(window.web3.currentProvider);
			} else if (window.parent !== window && window.parent.web3 !== undefined) {
				// Parent has something for us.
				console.log('loaded with parent web3 instance');
				this.$store.commit('setHasParentWeb3', true)
				web3 = new Web3(window.parent.web3.currentProvider);
			} else {
				web3 = null;
			}
			if (web3) {
				window.globalWeb3 = web3;
				this.initContract(web3);
				this.initTokenContract(web3);
				this.setAcountInterval(web3);
			}
		},
		initContract: function(web3) {
			let abi = [{
				"constant": false,
				"inputs": [{
						"name": "document",
						"type": "string"
					},
					{
						"name": "comment",
						"type": "string"
					},
					{
						"name": "ipfsHash",
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
						"name": "ipfsHash",
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
						"name": "ipfsHash",
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
				"name": "hasProof",
				"outputs": [{
					"name": "",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"inputs": [{
					"name": "tokenAddress",
					"type": "address"
				}],
				"payable": false,
				"type": "constructor"
			}];
			let PoEContract = web3.eth.contract(abi);
			PoEContract.at(this.$store.state.contractAddress, (err, contract) => {
				window.globalContract = contract;
				this.$store.commit('setContractReady', true);
				// app.loadAllProofs();
			});
		},
		initTokenContract: function(web3) {
			let abi = [{
				"constant": false,
				"inputs": [],
				"name": "launch",
				"outputs": [],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "creator",
				"outputs": [{
					"name": "",
					"type": "address"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "name",
				"outputs": [{
					"name": "",
					"type": "string"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "_spender",
						"type": "address"
					},
					{
						"name": "_value",
						"type": "uint256"
					}
				],
				"name": "approve",
				"outputs": [{
					"name": "success",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "totalSupply",
				"outputs": [{
					"name": "",
					"type": "uint256"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "_from",
						"type": "address"
					},
					{
						"name": "_to",
						"type": "address"
					},
					{
						"name": "_value",
						"type": "uint256"
					}
				],
				"name": "transferFrom",
				"outputs": [{
					"name": "success",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "decimals",
				"outputs": [{
					"name": "",
					"type": "uint8"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "version",
				"outputs": [{
					"name": "",
					"type": "string"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [{
					"name": "_owner",
					"type": "address"
				}],
				"name": "balanceOf",
				"outputs": [{
					"name": "balance",
					"type": "uint256"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "_addresses",
						"type": "address[]"
					},
					{
						"name": "_values",
						"type": "uint256[]"
					}
				],
				"name": "prefill",
				"outputs": [],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "symbol",
				"outputs": [{
					"name": "",
					"type": "string"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "_to",
						"type": "address"
					},
					{
						"name": "_value",
						"type": "uint256"
					}
				],
				"name": "transfer",
				"outputs": [{
					"name": "success",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": false,
				"inputs": [{
						"name": "_spender",
						"type": "address"
					},
					{
						"name": "_value",
						"type": "uint256"
					},
					{
						"name": "_extraData",
						"type": "bytes"
					}
				],
				"name": "approveAndCall",
				"outputs": [{
					"name": "success",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "transferableUntil",
				"outputs": [{
					"name": "",
					"type": "uint256"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [{
						"name": "_owner",
						"type": "address"
					},
					{
						"name": "_spender",
						"type": "address"
					}
				],
				"name": "allowance",
				"outputs": [{
					"name": "remaining",
					"type": "uint256"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "prefilled",
				"outputs": [{
					"name": "",
					"type": "bool"
				}],
				"payable": false,
				"type": "function"
			},
			{
				"inputs": [],
				"payable": false,
				"type": "constructor"
			},
			{
				"payable": false,
				"type": "fallback"
			},
			{
				"anonymous": false,
				"inputs": [{
						"indexed": true,
						"name": "_from",
						"type": "address"
					},
					{
						"indexed": true,
						"name": "_to",
						"type": "address"
					},
					{
						"indexed": false,
						"name": "_value",
						"type": "uint256"
					}
				],
				"name": "Transfer",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [{
						"indexed": true,
						"name": "_owner",
						"type": "address"
					},
					{
						"indexed": true,
						"name": "_spender",
						"type": "address"
					},
					{
						"indexed": false,
						"name": "_value",
						"type": "uint256"
					}
				],
				"name": "Approval",
				"type": "event"
			}];

			let TokenContract = web3.eth.contract(abi);
			TokenContract.at(this.$store.state.tokenAddress, (err, contract) => {
				window.globalTokenContract = contract;
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
