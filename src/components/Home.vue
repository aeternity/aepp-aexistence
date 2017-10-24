<template>
	<div class="home screen">
		<h1 class='center'>Success</h1>
		<p class="text center">
		This is the æxistence. This æpp enables you to proof the existance of digital files on the æternity blockchain and share it with other poeple.
		</p>
		<div class="pink next button">
			<router-link to="/chat">
				Create first proof
			</router-link>
		</div>
		<div v-if="this.$store.state.hasParentWeb3" class="quickIdPlaceholder"></div>
	</div>
</template>

<script src='./Home.js'>
</script>

<style scoped>
</style>
