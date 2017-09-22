<template>
	<div class="screen proof">

		<div :class="{'proof-image' :true, image: true, fullscreen : cssClass.image.fullscreen}" @click='toggleImage' :style='"background-image:url(" +proof.image+ ")"'></div>

		<div class="columns">
			<div class="column">
				<div class="proof-title">{{ proof.title }}</div>
				<div class="proof-created">{{ readableTimestamp(proof.created) }}</div>
			</div>
			<!-- <div class="column">
		 <div class='proof-confirmations'>{{ proof.confirmations }} confirmations</div>
		 </div> -->
		</div>

		<table>
			<tr>
				<td>Owner</td>
				<td class='proof-owner'><a target="_blank" :href="etherscanLink(proof.owner, 'address')">{{ proof.owner }}</a></td>
			</tr>
			<tr>
				<td>Contract</td>
				<td class='proof-contract'><a target="_blank" :href="etherscanLink(proof.contract, 'address')">{{ proof.contract }}</a></td>
			</tr>
			<tr>
				<td>Block</td>
				<td class='proof-block'><a target="_blank" :href="etherscanLink(proof.block, 'block')">{{ proof.block }}</a></td>
			</tr>
			<tr class='sep'>
				<td colspan=2><hr></td>
			</tr>
			<tr>
				<td>File Sha256</td>
				<td class='proof-fileSha256'>{{ proof.fileSha256 }}</td>
			</tr>
		</table>
	</div>
</template>

<script src='./Proof.js'/>

<style scoped>
</style>
