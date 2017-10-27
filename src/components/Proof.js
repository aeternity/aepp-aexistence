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
			rawProof: null,
      image : null
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
				image: null,
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
        data.image = this.image;
        this.image = null;
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
          console.log('getProof', err, proof);
          
					this.rawProof = proof;
          let ipfsHash = proof[4];
          //now we can see other's proofs
          this.getIpfsContent(ipfsHash, (image)=>{
            this.image = image;
          },(err)=>{
            console.log('Something went wrong fetching ipfs data: ' + err);
          });
					
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
