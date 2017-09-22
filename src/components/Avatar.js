export default {
		name : 'avatar',
		props : [
			'image',
			'blockie'
		],
		computed : {
			style : function() {
				return {
					// backgroundImage: "url('"+this.image+"')",
					backgroundColor: '#d1d1d1'
				}
			}
		}
	}
