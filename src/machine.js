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
				]
			}),
			welcome: new Question("How about creating your first proof? You can prove the existence of a picture or a file.", {
				answers: [
					AnswerFactory.answer('Picture', 'picture', /picture/i),
					AnswerFactory.answer('File', 'file', /file/i),
					AnswerFactory.answer('Why', 'why', /why/i),
				]
			}),

			picture: new Question("Insert Picture", {
				onEnter: function() {
					fsm.transition("pay");
				},
				answers: [
					AnswerFactory.answer('pay', 'pay', /^.*$/i),
				]
			}),

			file: new Question("Insert File", {
				answers: []
			}),

			why: new Question("More explanation soon1", {
				answers: [
					AnswerFactory.answer('Picture', 'picture', /picture/i),
					AnswerFactory.answer('File', 'file', /file/i),
				]
			}),

			pay: new Question("You have to pay x moneys", {
				answers: [
					AnswerFactory.answer('Okay', 'explainPaymentRequest', /okay/i, function(answerText) {
						fsm.emit('startProof', {
							text: 'textToProof'
						});
					}),
					AnswerFactory.answer('Cancel', 'welcome', /cancel/i),
				]
			}),

			explainPaymentRequest: new Question("A payment request has been issued. Check metamask!", {
				
			}),
		}
	});

	return fsm;
};
