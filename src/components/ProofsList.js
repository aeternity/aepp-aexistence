import ProofsListEntry from './ProofsListEntry.vue'

export default {
  name: 'proofs-list',
  components: {
    'proofsListEntry': ProofsListEntry
  },
  computed: {
    proofs: function () {
      return this.$store.state.proofs
    }
  }
}
