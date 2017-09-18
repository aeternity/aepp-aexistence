export default {
	name: 'camera',
	props : [
		'show'
	],
	data : function() {
		return {
			//show : false,
		};
	},
	methods : {
		close : function() {
			this.$emit('picture');
		}
	}
}
