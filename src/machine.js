let Conversational = require('conversational-machine');
let ConversationalFSM = Conversational.ConversationalFSM;
let Question = Conversational.Question;
let WidgetQuestion = Conversational.WidgetQuestion;
let AnswerFactory = Conversational.AnswerFactory;


module.exports = function() {
	let fsm = new Conversational.ConversationalFSM({
		initialState: "uninitialized",
		states: {
			uninitialized: new Question(null, {
				answers: [
					AnswerFactory.answer('Start', 'welcome', /^.*$/i),
					AnswerFactory.answer('No Web3', 'noWeb3', /^.*$/i),
				]
			}),

			noWeb3: new Question("Please install and unlock metamask and choose a wallet.", {

			}),

			welcome: new Question("How about creating your first proof? You can prove the existence of a picture or a file.", {
				answers: [
					AnswerFactory.answer('Picture', 'picture', /picture/i),
					AnswerFactory.answer('File', 'file', /file/i),
					AnswerFactory.answer('Why', 'why', /why/i),
				]
			}),

			picture: new Question("Choose an image to create a proof for", {
				onEnter: function() {
					fsm.emit('showFileUpload', true);
				},
				onLeave: function() {
					fsm.emit('showFileUpload', false);
				},
				answers: [
					AnswerFactory.freetext('', 'name', /^.*$/i),
				]
			}),

			file: new Question("Insert File is not implemented yet", {
				onEnter: function() {
					fsm.transition('welcome');
				},
				answers: [
					AnswerFactory.freetext('', 'welcome', /^.*$/i),
				]
			}),

			why: new Question("More explanation soon1", {
				answers: [
					AnswerFactory.answer('Picture', 'picture', /picture/i),
					AnswerFactory.answer('File', 'file', /file/i),
				]
			}),

			name: new Question("OK! Now you want to give your proof a reasonable name. Make it descriptive!", {
				onEnter: function() {
					fsm.emit('showFreetext', true);
				},
				onLeave: function() {
					fsm.emit('showFreetext', false);
				},
				answers: [
					AnswerFactory.freetext('description', 'pay', /^.*$/i, function(givenDescription) {
						fsm.emit('proofDescriptionGiven', givenDescription);
					})
				]
			}),

			pay: new Question("The transaction will cost approx... 12 AE.", {
				answers: [
					AnswerFactory.answer('Okay', 'explainPaymentRequest', /okay/i, function(answerText) {
						fsm.emit('startProof');
					}),
					AnswerFactory.answer('Why?', 'whyPay', /why/i),
					AnswerFactory.answer('Cancel', 'welcome', /cancel/i),
				]
			}),

			whyPay: new Question("Transaction Fees explained", {
				onEnter: function() {
					fsm.transition('pay');
				},
				answers: [
					AnswerFactory.freetext('', 'pay', /^.*$/i),
				]
			}),

			explainPaymentRequest: new Question("A payment request has been issued. Check metamask!", {
				answers: [
					AnswerFactory.freetext('', 'summary', /^.*$/i),
					AnswerFactory.freetext('', 'transactionError', /^.*$/i),
				]
			}),

			transactionError: new Question("Transaction Error", {
				onEnter: function() {
					fsm.transition('pay');
				},
				answers: [
					AnswerFactory.freetext('', 'pay', /^.*$/i),
				]
			}),

			summary: new Question("Success! Your proof has been created.", {
				onEnter: function() {
					fsm.emit('showSummary');
				}
			}),
		}
	});

	return fsm;
};
