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

			<div class='proof' v-if='body.type === 4'>
				<div v-if='proof.loading'>
					<p class='text'>loading</p>
				</div>
				<div v-if='!proof.loading'>
					<div class="image" v-if='proofImage' :style='"background-image:url(" + proofImage + ")"'></div>
					<p class='text' v-if='proof.data.fileSha256'>{{proof.data.fileSha256}}</p>
					<p class='text' v-if='proof.data.title'>{{proof.data.title}}</p>
					<p class='text' v-if='proof.data.ipfsHash'>{{proof.data.ipfsHash}}</p>
					<a v-if='proof.data.txId' :href="etherscanLink(proof.data.txId, 'tx')" target="_blank" class='text'>{{proof.data.txId}}</a>
					<router-link :to="{ name: 'proof', params: { id: body.hash }}">View Proof</router-link>
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
