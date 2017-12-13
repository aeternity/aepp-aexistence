<template>
	<div id="app" :class="{ stage: isStage }">
		<ae-menu
			:entries='menuEntries'
			:identity='identity'
			:showBurger='showBurger'
			:navopen='navopen'
		>

		<button slot='left-action' v-show='showBack' @click='$router.push("/proofs")'>
			<svg class='back' width="11" height="18" viewBox="0 0 11 18" xmlns="http://www.w3.org/2000/svg">
				<path d="M11 2L9 0 0 9l9 9 2-2-7-7z" fill="#4A4A4A" fill-rule="evenodd"/>
			</svg>
		</button>
		<span slot='title'>
			{{title}}
		</span>

			<router-link slot='right-action' v-show='showAdd' to='/chat'>
				<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
					<g fill="#4A4A4A" fill-rule="evenodd"><path d="M0 9h20v2H0z"/><path d="M11 0v20H9V0z"/></g>
				</svg>
			</router-link>
			<identity v-if="showQuickId" />
		</ae-menu>
		<!-- <img src="./assets/logo.png"> -->
		<router-view></router-view>
	</div>
</template>

<script src='./App.js'/>

<style src='./main.css'></style>
