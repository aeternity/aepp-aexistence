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

      let proof = this.$store.state.proofs.find((el)=>{return el.fileSha256 = this.$route.params.id;});
			return proof;
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
