<template>
	<div class="speech-container">
		<div :class="thisclass">
			<p class='text' v-if='body.type === 0'>{{body.text}}</p>

			<div v-if='body.type === 3'>
				<p class='text'>{{body.description}}</p>
				<a :href="body.url" target="_blank" class='text'>{{body.title}}</a>
			</div>

			<div class='image' :style='style' v-if='body.type === 1'>
				<div class='linkwrap' v-if='body.link'>
					<router-link :to='body.link'>
						{{ body.linktext }}
					</router-link>
				</div>
			</div>
		</div>
	</div>
</template>

<script src='./Speech.js'>
export default {
	name: '',
	data () {
		return {
		}
	}
}
</script>

<style scoped>
</style>
