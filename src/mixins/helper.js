import moment from 'moment'
const blockies = require('ethereum-blockies-png')
const ipfsAPI = require('ipfs-api')

let ipfsClient = null

export default {
	methods: {
		getIpfsClient: function () {
			if (ipfsClient === null) {
				let ipfsConf = this.$store.state.ipfs
				ipfsClient = ipfsAPI(ipfsConf.host, ipfsConf.port, {protocol: ipfsConf.protocol})
			}
			return ipfsClient
		},
		getIpfsContent: function (ipfsHash) {
			let ipfs = this.getIpfsClient()
			return new Promise(function (resolve, reject) {
				ipfs.files.get(ipfsHash, function (err, stream) {
					if (err) {
						return reject(err)
					}
					stream.on('data', (file) => {
						// write the file's path and contents to standard out
						console.log(file.path)
						let image = file.content.read()
						if (image != null) {
							return resolve(image.toString())
						}
						return reject(Error('No Image'))
					})
				})
			})
		},
		addIpfsContent: function (content, callback = function () {}, errCb = function () {}) {
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
