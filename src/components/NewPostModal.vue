<template>
	<ion-content>
		<video ref="camera">
			<source src="" />
		</video>
	</ion-content>
</template>

<script setup lang="ts">
	import { ref, onMounted } from 'vue'
	import { IonContent } from '@ionic/vue'

	const camera = ref(null)
	onMounted(() => {
		// Camera
		console.debug('camera', camera)
		const videoDevice = navigator?.mediaDevices?.getUserMedia({ video: true })
		if (videoDevice)
			videoDevice.then(stream => {
				camera.value.srcObject = stream
				camera.value.play()
			})
	})
</script>

<style scoped></style>
