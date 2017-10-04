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
					fsm.emit('showFileUpload', true)
					fsm.emit('openFilePicker')
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
				onEnter: function () {
					fsm.emit('showExistingProof')
				},
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
				onEnter: function () {
					fsm.emit('startUpload')
				},
				answers: [
					AnswerFactory.freetext('', 'showSummary', /^.*$/i),
					AnswerFactory.freetext('', 'askStorage', /^.*$/i)
				]
			}),

			showSummary: new Question('To finish you must...', {
				onEnter: function () {
					fsm.emit('showSummary')
				},
				answers: [
					AnswerFactory.answer('Approve', 'triggerTransaction', /approve/i),
					AnswerFactory.answer('I changed my mind!', 'askStorage', /changed/i)
				]
			}),

			triggerTransaction: new Question('', {
				onEnter: function () {
					fsm.emit('startProof')
				},
				answers: [
					AnswerFactory.freetext('', 'showSuccess', /^.*$/i),
					AnswerFactory.freetext('', 'transactionError', /^.*$/i)
				]
			}),

			transactionError: new Question('An Error...', {
				answers: [
					AnswerFactory.answer('Try again', 'triggerTransaction', /try/i),
					AnswerFactory.answer('Cancel', 'clear', /cancel/i)
				]
			}),

			showSuccess: new Question('Success!', {
				answers: [
					AnswerFactory.answer('New proof', 'clear', /new/i),
					AnswerFactory.answer('Show my proofs', 'showProofList', /show/i)
				]
			}),

			showProofList: new Question('', {
				onEnter: function () {
					fsm.emit('showProofList')
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
			})
		}
	})

	return fsm
}
