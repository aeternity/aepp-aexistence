import AeMenuEntry from './aeMenuEntry.vue'
import { AeIdentityAvatar } from '@aeternity/aepp-components'

export default {
  name: 'AeMenu',
  components: {
    'ae-identity-avatar': AeIdentityAvatar,
    'ae-menu-entry': AeMenuEntry
  },
  props: {
    'entries': {
      type: Array
    },
    'showBurger': {
      type: Boolean,
      defaul: true
    },
    'navopen': {
      type: Boolean,
      default: false
    },
    'identity': {
      type: Object
    }
  },
  data: function () {
    return {
    }
  },
  computed: {
    thisclass: function () {
      return {
        'ae-menu': true,
        'open': this.navopen
      }
    }
  },
  methods: {
    toggleopen: function () {
      // this.navopen = !this.navopen
      this.$emit('toggle-menu')
    }
  }
}
