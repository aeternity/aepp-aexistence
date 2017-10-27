import moment from 'moment'
const blockies = require('ethereum-blockies-png')
const ipfsAPI = require('ipfs-api')

export default {
	methods: {
		getIpfsClient: function (host = 'localhost', port = 5001, protocol = 'http') {
			return ipfsAPI(host, port, {protocol: protocol})
		},
		getIpfsContent: function (ipfsHash, callback, errCb) {
			let ipfs = this.getIpfsClient()
			ipfs.files.get(ipfsHash, function (err, stream) {
				if (err) {
					errCb(err)
				}
				stream.on('data', (file) => {
					// write the file's path and contents to standard out
					console.log(file.path)
					callback(file.content)
				})
			})
		},
		addIpfsContent: function (content, callback, errCb) {
			let ipfs = this.getIpfsClient()
			ipfs.add([content], (err, res) => {
				if (err) {
					errCb(err)
					throw err
				}
				callback(res[0].hash)
			})
		},
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
		},
		blockie: function (address) {
			return blockies.createDataURL({
				seed: address
			})
		}
	}
}
