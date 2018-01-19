import Swiper from 'swiper'
export default {
  mounted () {
    /* eslint-disable no-new */
    new Swiper('.swiper-container', {
      pagination: '.swiper-pagination',
      nextButton: '.next'
    })
  }
}
