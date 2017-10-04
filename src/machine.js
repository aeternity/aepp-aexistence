let Conversational = require('conversational-machine')
// let ConversationalFSM = Conversational.ConversationalFSM
let Question = Conversational.Question
// let WidgetQuestion = Conversational.WidgetQuestion
let AnswerFactory = Conversational.AnswerFactory

// export default function () {
module.exports = function () {
	let fsm = new Conversational.ConversationalFSM({
		initialState: 'uninitialized',
		states: {
			uninitialized: new Question(null, {
				answers: [
					AnswerFactory.answer('Start', 'checkRequirements', /^.*$/i)
				]
			}),

			checkRequirements: new Question('', {
				onEnter: function () {
					fsm.emit('checkRequirements')
				},
				answers: [
					AnswerFactory.freetext('', 'welcome', /^.*$/i),
					AnswerFactory.freetext('', 'noWeb3', /^.*$/i),
					AnswerFactory.freetext('', 'notUnlocked', /^.*$/i),
					AnswerFactory.freetext('', 'noEther', /^.*$/i),
					AnswerFactory.freetext('', 'noToken', /^.*$/i)
				]
			}),

			noWeb3: new Question('To use this service you need a web3 provider like metamask installed.', {
				answers: [
					AnswerFactory.answer('Check again', 'checkRequirements', /^.*$/i)
				]
			}),

			notUnlocked: new Question('To use this service you need to unlock metamask. Please unlock metamask and check again.', {
				answers: [
					AnswerFactory.answer('Check again', 'checkRequirements', /^.*$/i)
				]
			}),

			noEther: new Question('To use this service you need some ether to pay the transaction fees aka gas. Please get some ether or change accounts and check again.', {
				answers: [
					AnswerFactory.answer('Check again', 'checkRequirements', /^.*$/i)
				]
			}),

			noToken: new Question('For now this service is just for the Æternity community. This is why you need some AE-Tokens in your account. Please get some AE-Tokens or change accounts and check again.', {
				answers: [
					AnswerFactory.answer('Check again', 'checkRequirements', /^.*$/i)
				]
			}),

			welcome: new Question('You can create a proof or check for an existing proof.', {
				answers: [
					AnswerFactory.answer('Select File', 'selectFile', /^select/i),
					AnswerFactory.answer('Why would I do that?', 'whyProof', /^why/i)
				]
			}),

			whyProof: new Question('Mainly to proof to', {
				answers: [
					AnswerFactory.answer('Select File', 'selectFile', /^select/i),
					AnswerFactory.answer('How does that work?', 'howProofWorks', /^how/i)
				]
			}),

			howProofWorks: new Question('I calculate a', {
				answers: [
					AnswerFactory.answer('Select File', 'selectFile', /^select/i),
					AnswerFactory.answer('Cancel', 'clear', /cancel/i)
				]
			}),

			selectFile: new Question('', {
				onEnter: function () {
					fsm.emit('openFilePicker', true)
					fsm.emit('showFileUpload', true)
				},
				onLeave: function () {
					fsm.emit('showFileUpload', false)
				},
				answers: [
					AnswerFactory.answer('Cancel', 'clear', /cancel/i),
					AnswerFactory.freetext('', 'giveName', /^.*$/i),
					AnswerFactory.freetext('', 'proofExists', /^.*$/i),
					AnswerFactory.freetext('', 'filesizeLimit', /^.*$/i)
				]
			}),

			filesizeLimit: new Question('Error: File size', {
				answers: [
					AnswerFactory.answer('Pick different file', 'selectFile', /^select/i),
					AnswerFactory.answer('Cancel', 'clear', /cancel/i)
				]
			}),

			proofExists: new Question('This file has already been proofed.', {
				answers: [
					AnswerFactory.answer('Cancel', 'clear', /cancel/i)
				]
			}),

			giveName: new Question('OK! Now you want to give your proof a reasonable name. Make it descriptive! Remember: The longer the description the higher the gas costs.', {
				onEnter: function () {
					fsm.emit('showFreetext', true)
				},
				onLeave: function () {
					fsm.emit('showFreetext', false)
				},
				answers: [
					AnswerFactory.freetext('description', 'askStorage', /^.*$/i, function (givenDescription) {
						fsm.emit('proofDescriptionGiven', givenDescription)
					})
				]
			}),

			askStorage: new Question('Do you want me to save...?', {
				answers: [
					AnswerFactory.answer('Save it', 'storeFile', /save/i),
					AnswerFactory.answer('Nope – I got it!', 'showSummary', /nope/i)
				]
			}),

			storeFile: new Question('', {
				answers: [
					AnswerFactory.freetext('', 'showSummary', /^.*$/i),
					AnswerFactory.freetext('', 'askStorage', /^.*$/i)
				]
			}),

			showSummary: new Question('To finish you must...', {
				answers: [
					AnswerFactory.answer('Approve', 'triggerTransaction', /approve/i),
					AnswerFactory.answer('I changed my mind!', 'askStorage', /changed/i)
				]
			}),

			triggerTransaction: new Question('', {
				answers: [
					AnswerFactory.freetext('', 'showSuccess', /^.*$/i),
					AnswerFactory.freetext('', 'transactionError', /^.*$/i)
				]
			}),

			transactionError: new Question('An Error...', {
				answers: [
					AnswerFactory.answer('Try again', 'triggerTransaction', /try/i)
				]
			}),

			showSuccess: new Question('Success!', {
				answers: [
					AnswerFactory.answer('New proof', 'clear', /new/i),
					AnswerFactory.answer('Show my proofs', 'showProofList', /show/i)
				]
			}),

			showProofList: new Question('', {
				answers: []
			}),

			clear: new Question('', {
				onEnter: function () {
					fsm.emit('clearProof')
					fsm.transition('welcome')
				},
				answers: [
					AnswerFactory.freetext('', 'welcome', /^.*$/i)
				]
			})

			// createProof: new Question('How about creating your first proof? You can prove the existence of a picture.', {
			// 	answers: [
			// 		AnswerFactory.answer('Picture with upload', 'pictureWithUpload', /^picture/i),
			// 		AnswerFactory.answer('File without upload', 'fileNoUpload', /^file/i),
			// 		AnswerFactory.answer('Text', 'proofByString', /^text/i),
			// 		AnswerFactory.answer('Explain these options', 'explainProofMethods', /^explain/i)
			// 	]
			// }),
			//
			// pictureWithUpload: new Question('Choose a Picture to create a proof for. The Picture will be uplaoded and stored on our servers.', {
			// 	onEnter: function () {
			// 		fsm.emit('showFileUpload', true)
			// 	},
			// 	onLeave: function () {
			// 		fsm.emit('showFileUpload', false)
			// 	},
			// 	answers: [
			// 		AnswerFactory.freetext('', 'name', /^.*$/i)
			// 	]
			// }),
			//
			// fileNoUpload: new Question('Choose a File. The Hash is generated locally in your browser.', {
			// 	onEnter: function () {
			// 		fsm.emit('showFileUpload', true)
			// 	},
			// 	onLeave: function () {
			// 		fsm.emit('showFileUpload', false)
			// 	},
			// 	answers: [
			// 		AnswerFactory.freetext('', 'name', /^.*$/i)
			// 	]
			// }),
			//
			// proofByString: new Question('You can enter a sha256 hash of a file you want to notarize without passing it to our application. Just calculate the hash on your local machine and enter it here.', {
			// 	onEnter: function () {
			// 		fsm.emit('showFreetext', true)
			// 	},
			// 	onLeave: function () {
			// 		fsm.emit('showFreetext', false)
			// 	},
			// 	answers: [
			// 		AnswerFactory.freetext('inputhashString', 'checkManualInput', /^.*$/i, function (givenText) {
			// 			fsm.emit('proofTextGiven', givenText)
			// 		})
			// 	]
			// }),
			//
			// checkManualInput: new Question('', {
			// 	onEnter: function () {
			// 		fsm.emit('checkManualInput', true)
			// 	},
			// 	answers: [
			// 		AnswerFactory.freetext('', 'name', /^.*$/i),
			// 		AnswerFactory.freetext('', 'proofByString', /^.*$/i)
			// 	]
			// }),
			//
			// why: new Question('Proof of Existence is an online service that verifies the existence of computer files as of a specific time via timestamped transactions in the ethereum blockchain. A Hash of the uploaded Picture together with a short description will be stored in the contract.', {
			// 	onEnter: function () {
			// 		fsm.transition('welcome')
			// 	},
			// 	answers: [
			// 		AnswerFactory.freetext('', 'welcome', /^.*$/i)
			// 	]
			// }),
			//
			//
			//
			// pay: new Question('I will now calculate the estimated Gas usage.', {
			// 	onEnter: function () {
			// 		fsm.emit('showGasEstimate')
			// 	},
			// 	answers: [
			// 		AnswerFactory.answer('Okay', 'explainPaymentRequest', /okay/i, function (answerText) {
			// 			fsm.emit('startProof')
			// 		}),
			// 		AnswerFactory.answer('Why?', 'whyPay', /why/i),
			// 		AnswerFactory.answer('Cancel', 'clear', /cancel/i)
			// 	]
			// }),
			//
			// whyPay: new Question('TODO: Transaction Fees explained', {
			// 	onEnter: function () {
			// 		fsm.transition('pay')
			// 	},
			// 	answers: [
			// 		AnswerFactory.freetext('', 'pay', /^.*$/i)
			// 	]
			// }),
			//
			// explainPaymentRequest: new Question('A payment request has been issued. Check metamask!', {
			// 	answers: [
			// 		AnswerFactory.freetext('', 'summary', /^.*$/i),
			// 		AnswerFactory.freetext('', 'transactionError', /^.*$/i),
			// 		AnswerFactory.freetext('', 'clear', /^.*$/i)
			// 	]
			// }),
			//
			// transactionError: new Question('Transaction Error', {
			// 	onEnter: function () {
			// 		fsm.transition('pay')
			// 	},
			// 	answers: [
			// 		AnswerFactory.freetext('', 'pay', /^.*$/i)
			// 	]
			// }),
			//
			// summary: new Question('Success! Your proof has been issued. It may take a while until its written to the blockchain.', {
			// 	onEnter: function () {
			// 		fsm.emit('showSummary')
			// 	},
			// 	answers: [
			// 		AnswerFactory.answer('Cancel', 'clear', /cancel/i)
			// 	]
			// }),
			//
			//
			//
			// checkPicture: new Question('Choose an image to check for existing proofs.', {
			// 	onEnter: function () {
			// 		fsm.emit('showFileUpload', true)
			// 	},
			// 	onLeave: function () {
			// 		fsm.emit('showFileUpload', false)
			// 	},
			// 	answers: [
			// 		AnswerFactory.answer('Cancel', 'clear', /^cancel/i)
			// 	]
			// })
		}
	})

	return fsm
}
