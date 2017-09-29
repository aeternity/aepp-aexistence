<template>
	<router-link :to='"/proofs/"+proof.fileSha256'>
		<div class="proofs-list-entry">
			<div class="left">
				<div :style='"background-image:url(" +proof.image+ ")"' class="proof-image">
				</div>
			</div>
			<div class="middle">
				<div class="proof-title">{{ proof.title }}</div>
				<div class="proof-created">{{ readableTimestamp(proof.created) }}</div>
			</div>
			<div class="right">
				
			</div>
		</div>
	</router-link>
</template>

<script src='./ProofsListEntry.js'/>

<style scoped>
</style>
