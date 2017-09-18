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
				image: '/img/uploads/' + hash,
				title: '',
				fileSha256: hash,
				created : null,
				verified : null,
				confirmations : 0,
				contract: '',
				owner: '',
				block: ''
			};

			if (this.rawProof) {
				data.contract = this.$store.state.contractAddress;
				data.owner = this.rawProof[0];
				data.created = this.rawProof[2];
				data.block = this.rawProof[3];
				data.title = this.rawProof[4];
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
