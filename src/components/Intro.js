import Swiper from 'swiper'
//import 'swiper/dist/css/swiper.css'
export default {
	mounted() {
		new Swiper('.swiper-container', {
			pagination: '.swiper-pagination',
			nextButton: '.next'
		})
	}
}
