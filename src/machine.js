import { ConversationalFSM, Question, AnswerFactory } from '@aeternity/conversational-machine'

// export default function () {
let machine = function () {
  let fsm = new ConversationalFSM({
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
          AnswerFactory.hidden('welcome'),
          AnswerFactory.hidden('noWeb3'),
          AnswerFactory.hidden('notUnlocked'),
          AnswerFactory.hidden('noEther'),
          AnswerFactory.hidden('noToken')
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

      welcome: new Question('Hi! I am æxistence – built to proof the existence of files on the blockchain. \n Select a file from your device to get started.', {
        answers: [
          AnswerFactory.settings('Select File', 'selectFile', /^select/i, {primary: true}),
          AnswerFactory.answer('Why would I do that?', 'whyProof', /^why/i)
        ]
      }),

      whyProof: new Question('Mainly to proof to third parties that an image or file existed at a certain point of time. ✍ \n Also to check if that exact same file has been registred before', {
        answers: [
          AnswerFactory.settings('Select File', 'selectFile', /^select/i, {primary: true}),
          AnswerFactory.answer('How does that work?', 'howProofWorks', /^how/i)
        ]
      }),

      howProofWorks: new Question('I calculate a SHA256 hash from the file and save it – together with the timestamp and the user adress – to one of the most secure data storages in the world: The blockchain.', {
        onEnter: function () {
          fsm.emit('showBubble', 'Note: Although my service is free, every block of information saved to the blockchain comes with a transaction fee.', {primary: true})
        },
        answers: [
          AnswerFactory.settings('Select File', 'selectFile', /^select/i, {primary: true}),
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
          AnswerFactory.hidden('giveName'),
          AnswerFactory.hidden('proofExists'),
          AnswerFactory.hidden('filesizeLimit')
        ]
      }),

      filesizeLimit: new Question('Error: File size limit reached. Try splitting up or compressing your file.', {
        answers: [
          AnswerFactory.settings('Pick different file', 'selectFile', /^select/i, {primary: true}),
          AnswerFactory.answer('Cancel', 'clear', /cancel/i)
        ]
      }),

      proofExists: new Question('This file has already been proofed.', {
        onEnter: function () {
          fsm.emit('showExistingProof')
        },
        answers: [
          AnswerFactory.settings('Cancel', 'clear', /cancel/i, {primary: true})
        ]
      }),

      giveName: new Question('Great, you uploaded a new file! Now give it a suitable name, but remember: This can’t be changed afterwards.', {
        onEnter: function () {
          fsm.emit('showFreetext', true)
          fsm.emit('showBubble', 'Note: The longer the name, the higher the gas costs for the transaction.', {primary: true})
          fsm.emit('showBubble', 'Warning: The name will be visible to public.', {primary: true})
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

      askStorage: new Question('Do you want me to save a copy of the file to an IPFS server?', {
        answers: [
          AnswerFactory.settings('Save it', 'storeFile', /save/i, {primary: true}),
          AnswerFactory.answer('Nope – I got it!', 'showSummary', /nope/i)
        ]
      }),

      storeFile: new Question('', {
        onEnter: function () {
          fsm.emit('startUpload')
        },
        answers: [
          AnswerFactory.hidden('showSummary'),
          AnswerFactory.hidden('askStorage')
        ]
      }),

      showSummary: new Question('To finish creating the proof, you must approve the transaction:', {
        onEnter: function () {
          fsm.emit('showSummary')
        },
        answers: [
          AnswerFactory.settings('Approve', 'triggerTransaction', /approve/i, {primary: true}),
          AnswerFactory.answer('I changed my mind!', 'askStorage', /changed/i, function () {
            fsm.emit('deleteIpfsHash')
          })
        ]
      }),

      triggerTransaction: new Question('', {
        onEnter: function () {
          fsm.emit('startProof')
        },
        answers: [
          AnswerFactory.hidden('showSuccess'),
          AnswerFactory.hidden('transactionError')
        ]
      }),

      transactionError: new Question('An error encountered. Be sure to pay at least the minimum transaction fee.', {
        answers: [
          AnswerFactory.settings('Try again', 'triggerTransaction', /try/i, {primary: true}),
          AnswerFactory.answer('Cancel', 'clear', /cancel/i)
        ]
      }),

      showSuccess: new Question('Sucess! The existence of your file is now proofable! Check it out:', {
        onEnter: function () {
          fsm.emit('showCreatedProof')
        },
        answers: [
          AnswerFactory.settings('New proof', 'clear', /new/i, {primary: true}),
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
          AnswerFactory.hidden('welcome')
        ]
      })
    }
  })

  return fsm
}

export default machine
