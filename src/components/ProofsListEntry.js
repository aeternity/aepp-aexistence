import helperMixin from '../mixins/helper.js'
export default {
	name: 'proofs-list-entry',
	mixins: [helperMixin],
	computed: {
		imageStyle: function() {
			if (this.proof && this.proof.image) {
				return "background-image:url(" + this.proof.image + ")";
			} else {
				return "background-color: #f5f5f5";
			}
		}
	},
	props: [
		'proof'
	]
}
