<template>
	<div class="screen">
		<div class="proofs-list">
			<proofs-list-entry :proof='proof' v-for='proof in proofs'></proofs-list-entry>
		</div>
		<div v-if="this.$store.state.hasParentWeb3" class="quickIdPlaceholder"></div>
	</div>
</template>

<script src='./ProofsList.js'/>

<style scoped>
</style>
