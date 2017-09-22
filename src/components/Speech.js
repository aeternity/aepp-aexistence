import MessageSenderEnum from '../MessageSenderEnum.js'
import MessageBodyTypeEnum from '../MessageBodyTypeEnum.js'
export default {
	name : 'speech',
	props : [
		'body',
		'sender'
	],
	computed : {
		thisclass : function() {
			return {
				'app' : this.sender === MessageSenderEnum.APP,
				'me' : this.sender === MessageSenderEnum.ME,
				'body-type-image ' : this.body.type === MessageBodyTypeEnum.IMAGE,
				'body-type-text' : this.body.type === MessageBodyTypeEnum.TEXT || this.body.type === MessageBodyTypeEnum.LINK,
				'speech': true,
			};
		},
		style : function() {
			return {
				backgroundImage: this.body.type === MessageBodyTypeEnum.IMAGE ? "url('"+this.body.image+"')" : null,
			};
		}
	}
}
