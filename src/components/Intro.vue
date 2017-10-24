<template>
	<div class="intro screen">
		<div class="nomargin inner">
			<div class='nomargin logo img' style="background-image:url(static/logo.png);"></div>
			<div class="swiper-container">
				<div class="swiper-wrapper">
					<div class="swiper-slide">

						<div class='img' style="background-image:url(static/welcome-1.png);"></div>
						<h1 class='center'>Welcome</h1>
						<p class="text center">
						This is the æxistence. This æpp enables you to proof the existance of digital files on the æternity blockchain and share it with other poeple.
						</p>
						<div class="pink next button">
							Next
						</div>

					</div>
					<div class="swiper-slide">

						<div class='img' style="background-image:url(static/welcome-2.png);"></div>

						<h1 class='center'>Proofs</h1>
						<p class="text center">
						Proofs are unchallengeable evidence that a file existed at a specific time in the past. They are immutable and resistent to manipulation.
						</p>
						<div class="pink next button">
							Next
						</div>

					</div>
					<div class="swiper-slide">

						<div class='img' style="background-image:url(static/welcome-3.png);"></div>

						<h1 class='center'>Welcome</h1>
						<p class="text center">
						In order to create proofs you need to identify with the Identity Manager. Please download it from the App Store and set up your identity.
						</p>
						<div class="pink button">
							<router-link to="/home">
								Open Identity Manager
							</router-link>
						</div>

					</div>
				</div>
				<div class="center notice">
					<router-link to="/home">skip</router-link>
				</div>
				<div class="swiper-pagination"></div>
			</div>
		</div>
		<div v-if="this.$store.state.hasParentWeb3" class="quickIdPlaceholder"></div>
	</div>
</template>

<script src='./Intro.js'/>

<style src="swiper/dist/css/swiper.css">
</style>
