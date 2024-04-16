<template>
    <ion-content>
        <ion-grid>
            <ion-row>
                <video v-show="!captured" ref="camera" loop muted autoplay @canplay="canplay()">
                    <source src="" />
                </video>
            </ion-row>
            <ion-row>
                <canvas ref="canvas"></canvas>
                <div class="gallery-view">
                    <img ref="outputImg" />
                </div>
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

    const width = ref(320)
    const height = ref(0)
    const camera = ref(null)
    const canvas = ref(null)
    const captured = ref(false)
    const outputImg = ref(null)
    const streaming = ref(false)
    let videoStream = null

    // Setup
    onMounted(() => {
        // Camera
        console.debug('camera', camera)
        const videoDevice = navigator?.mediaDevices?.getUserMedia({
            video: {
                width: { ideal: 320 },
                height: { ideal: 240 },
            },
        })
        // Video
        if (videoDevice) {
            videoDevice
                .then(stream => {
                    console.debug('stream', stream)
                    videoStream = stream
                    camera.value.srcObject = videoStream
                    camera.value.play()

                    // Canvas
                    console.debug('canvas', canvas)
                    canvas.value.setAttribute('width', stream.videoWidth)
                    canvas.value.setAttribute('height', stream.videoHeight)
                })
                .catch(err => {
                    console.error(`${err.name}: ${err.message}`)
                })
        } else {
            console.error('No video device found')
        }
    })

    // Setup width and height
    function canplay() {
        console.debug('canplay')

        if (!streaming.value) {
            console.debug('video', camera.value.videoWidth, camera.value.videoHeight)

            height.value = (camera.value.videoHeight / camera.value.videoWidth) * width.value
            //height.value = camera.value.videoHeight

            camera.value.setAttribute('width', width.value)
            camera.value.setAttribute('height', height.value)
            canvas.value.setAttribute('width', width.value)
            canvas.value.setAttribute('height', height.value)

            streaming.value = true
        }
    }

    // Capture picture
    function capture() {
        console.debug('capturing', videoStream)

        const context = canvas.value.getContext('2d')
        if (width.value && height.value) {
            canvas.value.width = width.value
            canvas.value.height = height.value
            context.drawImage(camera.value, 0, 0, width.value, height.value)
            const data = canvas.value.toDataURL('image/png')
            outputImg.value.setAttribute('src', data)

            captured.value = true
        }
    }
</script>

<style scoped>
    video {
        width: 100vw;
        object-fit: cover;
        /* transform: scaleX(-1); */
    }
    canvas {
        display: none;
    }

    .gallery-view {
        width: 100%;

        img {
            width: 100%;
        }
    }
</style>
