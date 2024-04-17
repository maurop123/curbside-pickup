<template>
    <ion-content>
        <ion-grid>
            <ion-row v-show="!captured">
                <video ref="camera" loop muted autoplay @canplay="canplay()">
                    <source src="" />
                </video>
            </ion-row>
            <ion-row v-show="captured">
                <canvas ref="canvas"></canvas>
                <div class="gallery-view">
                    <img ref="outputImg" />
                </div>
            </ion-row>
            <ion-row v-if="!captured" class="ion-justify-content-center">
                <ion-button @click="capture()"> Capture </ion-button>
            </ion-row>
            <ion-row v-else class="ion-justify-content-center">
                <ion-button
                    color="danger"
                    @click="clearCapture()"
                    :fill="capturedKeep ? 'outline' : 'solid'"
                >
                    Retry
                </ion-button>
                <ion-button color="success" @click="capturedKeep = !capturedKeep">
                    Keep
                    <ion-icon v-if="capturedKeep" slot="end" :icon="thumbsUp"></ion-icon>
                </ion-button>
            </ion-row>
        </ion-grid>
        <ion-grid v-if="capturedKeep">
            <ion-row>
                <ion-col size="12">
                    <ion-list>
                        <ion-item>
                            <ion-textarea
                                label="Description"
                                label-placement="stacked"
                                placeholder="Enter description of item"
                            ></ion-textarea>
                        </ion-item>
                        <ion-item>
                            <ion-range
                                class="px-0"
                                :label="`Condition: ${conditionText}`"
                                label-placement="stacked"
                                aria-label="slider with pin"
                                v-model="conditionSlider"
                            ></ion-range>
                        </ion-item>
                        <ion-item>
                            <ion-button @click="saveNewPost">Post</ion-button>
                        </ion-item>
                    </ion-list>
                </ion-col>
            </ion-row>
        </ion-grid>
    </ion-content>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue'
    import {
        IonButton,
        IonContent,
        IonIcon,
        IonList,
        IonItem,
        IonInput,
        IonRange,
        IonTextarea,
        IonGrid,
        IonRow,
        IonCol,
    } from '@ionic/vue'
    import { thumbsUpOutline, thumbsUpSharp, thumbsUp } from 'ionicons/icons'
    import { collection, addDoc } from 'firebase/firestore'
    import { useFirestore } from 'vuefire'
    import { useAppStore } from '@/stores/appStore'

    const appStore = useAppStore()

    const width = ref(320)
    const height = ref(0)
    const camera = ref(null)
    const canvas = ref(null)
    const captured = ref(false)
    const capturedKeep = ref(false)
    const conditionSlider = ref(50)
    const outputImg = ref(null)
    const streaming = ref(false)
    let videoStream = null

    const conditionText = computed(() => {
        const val = conditionSlider.value
        let text = ''
        if (val < 25) {
            text = 'Not so good'
        } else if (val < 50) {
            text = 'OK'
        } else if (val < 75) {
            text = 'Not bad!'
        } else if (val >= 75) {
            text = 'Great!'
        }
        return text
    })

    const db = useFirestore()

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

    function clearCapture() {
        if (captured.value) {
            if (capturedKeep.value) {
                capturedKeep.value = false
            } else {
                captured.value = false
            }
        }
    }

    async function saveNewPost() {
        try {
            const newDoc = {
                latitude: appStore.coordinates.latitude,
                longitude: appStore.coordinates.longitude,
            }
            console.debug('saveNewPost', newDoc)
            const docRef = await addDoc(collection(db, appStore.collectionName), newDoc)
            console.debug('New Post added:', docRef.id)
        } catch (e) {
            console.error('Error adding post:', e)
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
