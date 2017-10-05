import MessageSenderEnum from '../MessageSenderEnum.js'
import MessageBodyTypeEnum from '../MessageBodyTypeEnum.js'
import helperMixin from '../mixins/helper'
export default {
	name : 'speech',
	props : [
		'body',
		'sender',
		'primary'
	],
	mixins: [helperMixin],
	data: function() {
		return {
			proof: {
				loading: true,
				data: {
					contract: null,
					owner: null,
					created: null,
					block: null,
					title: null,
					fileSha256: null,
					ipfsHash: null,
					txId: null
				}
			}
		};
	},
	computed : {
		thisclass : function() {
			return {
				'app' : this.sender === MessageSenderEnum.APP,
				'me' : this.sender === MessageSenderEnum.ME,
				'body-type-image ' : this.body.type === MessageBodyTypeEnum.IMAGE,
				'body-type-text ' : this.body.type === MessageBodyTypeEnum.TEXT || this.body.type === MessageBodyTypeEnum.LINK,
				'body-type-proof ' : this.body.type === MessageBodyTypeEnum.PROOF,
				'speech': true,
				'primary': this.primary ? true : false
			};
		},
		style : function() {
			return {
				backgroundImage: this.body.type === MessageBodyTypeEnum.IMAGE ? "url('"+this.body.image+"')" : null,
			};
		},
		contractReady: function() {
			return this.$store.state.contractReady;
		},
		proofImage: function() {
			if (this.proof.data.ipfsHash) {
				return this.$store.state.apiBaseUrl + '/uploads/' + this.proof.data.ipfsHash
			} else {
				return null;
			}
		}
	},
	methods: {
		loadProof: function() {
			let contract = window.globalContract;
			if (contract) {
				contract.getProof(this.body.hash, (err, rawProof) => {
					console.log(err, rawProof);
					if (!err && rawProof) {
						this.proof.data.contract = this.$store.state.contractAddress;
						this.proof.data.owner = rawProof[0];
						this.proof.data.created = rawProof[1];
						this.proof.data.block = rawProof[2];
						this.proof.data.title = rawProof[3];
						this.proof.data.ipfsHash = rawProof[4];
						this.proof.data.fileSha256 = rawProof[5];
						this.proof.loading = false;
					} else {
						let txId = this.$store.getters.getTxByHash(this.body.hash);
						if (txId) {
							this.proof.data.txId = txId;
						}
						this.proof.loading = false;
					}
				});
			}

			setTimeout(() => {
				this.proof.loading = false;
			}, 2000);
		}
	},
	mounted: function() {
		if (this.body.type === MessageBodyTypeEnum.PROOF) {
			if (this.contractReady) {
				this.loadProof();
			}
		}
	},
	watch: {
		contractReady: function(val) {
			if (val === true) {
				if (this.body.type === MessageBodyTypeEnum.PROOF) {
					this.loadProof();
				}
			}
		}
	}
}
