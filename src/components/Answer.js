export default {
  name: 'answer',
  props: [
    'answer'
  ],
  computed: {
    isPrimary: function () {
      return this.answer.settings && this.answer.settings.primary
    }
  },
  methods: {
    answerClicked: function () {
      this.$emit('answerClicked')
    }
  }
}
