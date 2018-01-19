<template>
	<ae-modal title="Please connect to the identity manager" @close="close()">
		<div>Password: {{ password }}</div>
		<div><img :src="qrUrl"></img></div>
	</ae-modal>
</template>

<script src='./ConnectPopup.js'/>

<style scoped>
</style>
