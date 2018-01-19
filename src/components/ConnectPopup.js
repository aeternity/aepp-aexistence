import { AeModal } from '@aeternity/aepp-components'

export default {
  name: 'ConnectPopup',
  components: {
    AeModal
  },
  props: {
    password: {
      type: String,
      default: null
    }
  },
  computed: {
    qrUrl () {
      return 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + this.password
    }
  },
  data: function () {
    return {

    }
  },
  methods: {
    close () {
      this.$emit('close')
    }
  }
}
