import helperMixin from '../mixins/helper.js'

export default {
		name : 'avatar',
		props : [
			'image',
			'address'
		],
		mixins: [
			helperMixin
		],
		computed : {
			style : function() {
				return {
					// backgroundImage: "url('"+this.image+"')",
					// backgroundColor: '#d1d1d1'
					backgroundImage: "url('" + this.blockie(this.address) + "')",
				}
			}
		}
	}
