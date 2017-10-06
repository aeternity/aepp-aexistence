<template>
	<button class='answer' @click='answerClicked()' v-bind:class="{ primary: isPrimary }">{{answer.name}}</button>
</template>

<script src='./Answer.js'/>

<style scoped>
</style>
