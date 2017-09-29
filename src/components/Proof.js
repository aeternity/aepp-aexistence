import helperMixin from '../mixins/helper.js'
export default {
	name : 'proof',
	data : function() {
		return {
			cssClass : {
				image : {
					fullscreen : false,
				}
			},
			rawProof: null
		}
	},
	mixins: [
		helperMixin
	],
	computed : {
		hash: function() {
			return this.$route.params.id;
		},
		contractReady: function() {
			return this.$store.state.contractReady;
		},
		proof : function() {
			let hash = this.$route.params.id;
			let data = {
				image: this.$store.state.apiBaseUrl + '/uploads/' + hash,
				title: '',
				fileSha256: hash,
				created: null,
				ipfsHash: '',
				contract: '',
				owner: '',
				block: ''
			};

			if (this.rawProof) {
				data.contract = this.$store.state.contractAddress;
				data.owner = this.rawProof[0];
				data.created = this.rawProof[1];
				data.block = this.rawProof[2];
				data.title = this.rawProof[3];
				data.ipfsHash = this.rawProof[4];
				data.fileSha256 = this.rawProof[5];
			}

			return data;
		}
	},
	methods : {
		toggleImage : function() {
			this.cssClass.image.fullscreen =
				! this.cssClass.image.fullscreen;

		},
		getProof: function(text) {
			let contract = window.globalContract;
			if (contract) {
				contract.getProof(text, (err, proof) => {
					this.rawProof = proof;
					console.log('getProof', err, proof);
				});
			}
		},
	},
	mounted: function() {
		let app = this;
		if (app.contractReady) {
			app.getProof(app.hash);
		}
	},
	watch: {
		contractReady: function(val) {
			let app = this;
			if (val === true) {
				app.getProof(app.hash);
			}
		}
	}
};
