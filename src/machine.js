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
					AnswerFactory.answer('Start', 'welcome', /^.*$/i)
				]
			}),

			welcome: new Question('How about creating your first proof? You can prove the existence of a picture or a file.', {
				answers: [
					AnswerFactory.answer('Picture', 'picture', /picture/i),
					AnswerFactory.answer('Check Image', 'checkImage', /check/i),
					AnswerFactory.answer('File', 'file', /file/i),
					AnswerFactory.answer('Why', 'why', /why/i)
				]
			}),

			picture: new Question('Choose an image to create a proof for', {
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

			file: new Question('Insert File is not implemented yet', {
				onEnter: function () {
					fsm.transition('welcome')
				},
				answers: [
					AnswerFactory.freetext('', 'welcome', /^.*$/i)
				]
			}),

			why: new Question('More explanation soon1', {
				answers: [
					AnswerFactory.answer('Picture', 'picture', /picture/i),
					AnswerFactory.answer('File', 'file', /file/i)
				]
			}),

			name: new Question('OK! Now you want to give your proof a reasonable name. Make it descriptive!', {
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

			whyPay: new Question('Transaction Fees explained', {
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
				}
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

			checkImage: new Question('Choose an image to check for existing proofs.', {
				onEnter: function () {
					fsm.emit('showFileUpload', true)
				},
				onLeave: function () {
					fsm.emit('showFileUpload', false)
				},
				answers: [
					AnswerFactory.answer('Cancel', 'clear', /^.*$/i)
				]
			})
		}
	})

	return fsm
}
