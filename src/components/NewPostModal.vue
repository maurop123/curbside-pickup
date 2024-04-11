<template>
    <ion-content>
        <ion-grid>
            <ion-row>
                <video ref="camera">
                    <source src="" />
                </video>
            </ion-row>
            <ion-row>
                <canvas ref="canvas"></canvas>
                <img ref="stillImg" />
            </ion-row>
            <ion-row class="ion-justify-content-center">
                <ion-button @click="capture()"> Capture </ion-button>
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
    const width = ref(0)
    const height = ref(0)
    onMounted(() => {
        // Camera
        console.debug('camera', camera)
        const videoDevice = navigator?.mediaDevices?.getUserMedia({ video: true })
        if (videoDevice)
            videoDevice.then(stream => {
                videoStream = stream
                camera.value.srcObject = videoStream
                camera.value.play()

                // Canvas
                console.debug('canvas', canvas)
                canvas.setAttribute('width', stream.videoWidth)
                canvas.setAttribute('height', stream.videoHeight)
            })
    })

    // Capture
    function capture() {
        console.debug('capturing', videoStream)
        /*canvas.value.style.height = camera.value.clientHeight*/
        /*canvas.value.style.width = camera.value.clientWidth*/
        const context = canvas.value.getContext('2d')
        //context.drawImage(camera.value, 0, 0, 200, 150)
        context.drawImage(camera.value, 0, 0, camera.value.clientWidth, camera.value.clientHeight)
    }
</script>

<style scoped></style>
