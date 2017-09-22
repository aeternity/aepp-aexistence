import moment from 'moment'
export default {
	methods: {
		readableTimestamp: function (timestamp) {
			if (timestamp) {
				let momentTime = moment.unix(timestamp.toString())
				return momentTime.format('YYYY-MM-DD HH:mm')
			} else {
				return ''
			}
		},
		etherscanLink: function (value, type) {
			// type tx, address, block
			let baseurl = 'https://kovan.etherscan.io/'
			baseurl += type
			baseurl += '/'
			baseurl += value
			return baseurl
		}
	}
}
