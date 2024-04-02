<template>
	<ion-content>
		<ion-grid>
			<ion-row>
				<video ref="camera">
					<source src="" />
				</video>
			</ion-row>
			<ion-row class="ion-justify-content-center">
				<ion-button @click="capture()"> Capture </ion-button>
			</ion-row>
			<ion-row>
				<img ref="stillImg" />
				<canvas ref="canvas" />
			</ion-row>
		</ion-grid>
	</ion-content>
</template>

<script setup lang="ts">
	import { ref, onMounted } from 'vue'
	import { IonButton, IonContent } from '@ionic/vue'

	const camera = ref(null)
	const canvas = ref(null)
	const stillImg = ref(null)
	let videoStream = null
	onMounted(() => {
		// Camera
		console.debug('camera', camera)
		const videoDevice = navigator?.mediaDevices?.getUserMedia({ video: true })
		if (videoDevice)
			videoDevice.then(stream => {
				videoStream = stream
				camera.value.srcObject = videoStream
				camera.value.play()
			})

		// Canvas
		console.debug('canvas', canvas)
	})

	// Capture
	function capture() {
		console.debug('capturing', videoStream)
		const context = canvas.value.getContext('2d')
		context.drawImage(camera.value, 0, 0, 200, 150)
	}
</script>

<style scoped></style>
