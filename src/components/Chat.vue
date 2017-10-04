<template>
	<div class="screen">
		<div id='conv' class="nomargin conversation-container">
			<speech :body='message.body' :sender='message.sender' v-for='message in messages'></speech>
			<div v-show='showti' class="app speech typing-indicator">
				<span></span>
				<span></span>
				<span></span>
			</div>
		</div>

		<div class="response">

			<div class="answer-group">
				<button v-for="(answer, index) in answers" class='answer' @click='handleAnswer(answer)'>{{answer}}</button>

				<form  enctype='multipart/form-data' action="#" v-show='showFileUpload' @submit='preventSubmit'>
					<input id="selectedFile" class='answer' type="file" accept="image/*" @change="onFileChange" style="display: none;">
					<button class="answer" ref="fileButton" onclick="document.getElementById('selectedFile').click();">Choose File</button>
				</form>

				<input @keyup.enter='handleFreetextInput()' v-model='userInput' type="text" v-show='showFreetext'>
				<button @click='handleFreetextInput()' class='send' v-show='showFreetext'>Send</button>

			</div>
		</div>
	</div>
</template>

<script src='./Chat.js'/>

<style scoped>
</style>
