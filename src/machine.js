let Conversational = require('conversational-machine')
// let ConversationalFSM = Conversational.ConversationalFSM
let Question = Conversational.Question
// let WidgetQuestion = Conversational.WidgetQuestion
let AnswerFactory = Conversational.AnswerFactory

export default function () {
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
					AnswerFactory.answer('Create a proof', 'createProof', /^create/i),
					AnswerFactory.answer('Check Picture', 'checkPicture', /^check/i),
					// AnswerFactory.answer('File', 'file', /file/i),
					AnswerFactory.answer('Why', 'why', /why/i)
				]
			}),

			createProof: new Question('How about creating your first proof? You can prove the existence of a picture.', {
				answers: [
					AnswerFactory.answer('Picture with upload', 'pictureWithUpload', /^picture/i),
					AnswerFactory.answer('File without upload', 'fileNoUpload', /^file/i),
					AnswerFactory.answer('Text', 'proofByString', /^text/i),
					AnswerFactory.answer('Explain these options', 'explainProofMethods', /^explain/i)
				]
			}),

			pictureWithUpload: new Question('Choose a Picture to create a proof for. The Picture will be uplaoded and stored on our servers.', {
				onEnter: function () {
					fsm.emit('showFileUpload', true)
				},
				onLeave: function () {
					fsm.emit('showFileUpload', false)
				},
				answers: [
					AnswerFactory.freetext('', 'name', /^.*$/i)
				]
			}),

			fileNoUpload: new Question('Choose a File. The Hash is generated locally in your browser.', {
				onEnter: function () {
					fsm.emit('showFileUpload', true)
				},
				onLeave: function () {
					fsm.emit('showFileUpload', false)
				},
				answers: [
					AnswerFactory.freetext('', 'name', /^.*$/i)
				]
			}),

			proofByString: new Question('You can enter a sha256 hash of a file you want to notarize without passing it to our application. Just calculate the hash on your local machine and enter it here.', {
				onEnter: function () {
					fsm.emit('showFreetext', true)
				},
				onLeave: function () {
					fsm.emit('showFreetext', false)
				},
				answers: [
					AnswerFactory.freetext('inputhashString', 'checkManualInput', /^.*$/i, function (givenText) {
						fsm.emit('proofTextGiven', givenText)
					})
				]
			}),

			checkManualInput: new Question('', {
				onEnter: function () {
					fsm.emit('checkManualInput', true)
				},
				answers: [
					AnswerFactory.freetext('', 'name', /^.*$/i),
					AnswerFactory.freetext('', 'proofByString', /^.*$/i)
				]
			}),

			why: new Question('Proof of Existence is an online service that verifies the existence of computer files as of a specific time via timestamped transactions in the ethereum blockchain. A Hash of the uploaded Picture together with a short description will be stored in the contract.', {
				onEnter: function () {
					fsm.transition('welcome')
				},
				answers: [
					AnswerFactory.freetext('', 'welcome', /^.*$/i)
				]
			}),

			name: new Question('OK! Now you want to give your proof a reasonable name. Make it descriptive! Remember: The longer the description the higher the gas costs.', {
				onEnter: function () {
					fsm.emit('showFreetext', true)
				},
				onLeave: function () {
					fsm.emit('showFreetext', false)
				},
				answers: [
					AnswerFactory.freetext('description', 'pay', /^.*$/i, function (givenDescription) {
						fsm.emit('proofDescriptionGiven', givenDescription)
					})
				]
			}),

			pay: new Question('I will now calculate the estimated Gas usage.', {
				onEnter: function () {
					fsm.emit('showGasEstimate')
				},
				answers: [
					AnswerFactory.answer('Okay', 'explainPaymentRequest', /okay/i, function (answerText) {
						fsm.emit('startProof')
					}),
					AnswerFactory.answer('Why?', 'whyPay', /why/i),
					AnswerFactory.answer('Cancel', 'clear', /cancel/i)
				]
			}),

			whyPay: new Question('TODO: Transaction Fees explained', {
				onEnter: function () {
					fsm.transition('pay')
				},
				answers: [
					AnswerFactory.freetext('', 'pay', /^.*$/i)
				]
			}),

			explainPaymentRequest: new Question('A payment request has been issued. Check metamask!', {
				answers: [
					AnswerFactory.freetext('', 'summary', /^.*$/i),
					AnswerFactory.freetext('', 'transactionError', /^.*$/i),
					AnswerFactory.freetext('', 'clear', /^.*$/i)
				]
			}),

			transactionError: new Question('Transaction Error', {
				onEnter: function () {
					fsm.transition('pay')
				},
				answers: [
					AnswerFactory.freetext('', 'pay', /^.*$/i)
				]
			}),

			summary: new Question('Success! Your proof has been issued. It may take a while until its written to the blockchain.', {
				onEnter: function () {
					fsm.emit('showSummary')
				},
				answers: [
					AnswerFactory.answer('Cancel', 'clear', /cancel/i)
				]
			}),

			clear: new Question('', {
				onEnter: function () {
					fsm.emit('clearProof')
					fsm.transition('welcome')
				},
				answers: [
					AnswerFactory.freetext('', 'welcome', /^.*$/i)
				]
			}),

			checkPicture: new Question('Choose an image to check for existing proofs.', {
				onEnter: function () {
					fsm.emit('showFileUpload', true)
				},
				onLeave: function () {
					fsm.emit('showFileUpload', false)
				},
				answers: [
					AnswerFactory.answer('Cancel', 'clear', /^cancel/i)
				]
			})
		}
	})

	return fsm
}
