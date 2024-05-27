<template>
    <ion-modal>
        <ion-header>
            <ion-toolbar>
                <ion-grid class="p-0">
                    <ion-row>
                        <ion-col size="10" class="p-0">
                            <ion-title> New Post </ion-title>
                        </ion-col>
                        <ion-col size="2" class="text-right pt-2 pr-2">
                            <ion-icon
                                id="close-icon"
                                :icon="closeIcon"
                                size="large"
                                @click="$emit('dismiss')"
                            ></ion-icon>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <!-- Loader -->
            <ion-grid v-if="!cameraReady" class="loadingContainer">
                <ion-row class="ion-justify-content-center">
                    <ion-icon class="loading" :icon="refreshOutline"></ion-icon>
                </ion-row>
                <ion-row class="ion-justify-content-center">
                    <p class="loadingText">Requesting camera permissions</p>
                </ion-row>
            </ion-grid>
            <ion-grid v-show="cameraReady" class="cameraGrid">
                <!-- Video/Camera -->
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

                <!-- Capture Buttons -->
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

            <!-- Rest of the form -->
            <ion-grid v-if="capturedKeep" class="form p-2.5">
                <ion-row class="inputRow">
                    <p>Description</p>
                    <ion-textarea
                        v-model="description"
                        placeholder="Describe the item, its condition, location, etc..."
                    ></ion-textarea>
                </ion-row>
                <ion-row>
                    <ion-button @click="saveNewPost" class="postButton">
                        <span v-if="!activelySaving">Post</span>
                        <ion-icon v-else :icon="refreshOutline" class="loading"></ion-icon>
                    </ion-button>
                    <div class="submitText">
                        <p v-if="submitError" class="submitError">
                            {{ submitError }}
                        </p>
                        <p v-else-if="activelySaving">Please wait...</p>
                    </div>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-modal>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue'
    import type { Ref } from 'vue'
    import {
        IonButton,
        IonContent,
        IonIcon,
        IonTextarea,
        IonGrid,
        IonRow,
        IonCol,
        IonModal,
    } from '@ionic/vue'
    import { close, thumbsUp, refreshOutline } from 'ionicons/icons'
    import { getStorage, ref as StorageRef, uploadString } from 'firebase/storage'
    import { collection, addDoc } from 'firebase/firestore'
    import { useCurrentUser, useFirestore } from 'vuefire'
    import { useAppStore } from '@/stores/appStore'

    const activelySaving: Ref<boolean> = ref(false)
    const camera: Ref<any> = ref(null)
    const cameraReady: Ref<boolean> = ref(false)
    const canvas: Ref<any> = ref(null)
    const captured: Ref<boolean> = ref(false)
    const capturedKeep: Ref<boolean> = ref(false)
    const closeIcon = ref(close)
    const description: Ref<string> = ref('')
    const imgDataUrl: Ref<string> = ref('')
    const modal: Ref<any> = ref(null)
    const outputImg: Ref<any> = ref(null)
    const submitError = ref()
    const width: Ref<number> = ref(320)
    const height: Ref<number> = ref(0)
    let videoStream: any = null
    //Firebase
    const appStore = useAppStore()
    const fbStorage = getStorage()
    const db = useFirestore()

    // Setup
    onMounted(() => {
        // Camera
        console.debug('camera', camera)
        const videoDevice = navigator?.mediaDevices?.getUserMedia({
            video: {
                width: { ideal: 320 },
                height: { ideal: 240 },
                facingMode: 'environment',
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

        if (!cameraReady.value) {
            console.debug('video', camera.value.videoWidth, camera.value.videoHeight)

            height.value = (camera.value.videoHeight / camera.value.videoWidth) * width.value
            //height.value = camera.value.videoHeight

            camera.value.setAttribute('width', width.value)
            camera.value.setAttribute('height', height.value)
            canvas.value.setAttribute('width', width.value)
            canvas.value.setAttribute('height', height.value)

            cameraReady.value = true
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

            imgDataUrl.value = canvas.value.toDataURL('image/png')
            outputImg.value.setAttribute('src', imgDataUrl.value)

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
        activelySaving.value = true
        submitError.value = null

        try {
            if (!description.value) {
                throw 'Description is empty. Please fill in'
            }

            const newDoc = {
                createdAt: Date.now(),
                description: description.value,
                latitude: appStore.coordinates.latitude,
                longitude: appStore.coordinates.longitude,
                // @ts-ignore
                uid: useCurrentUser().value.uid,
                version: 3,
            }
            console.debug('saveNewPost', newDoc)

            const docRef = await addDoc(collection(db, 'curbside-posts'), newDoc)
            const storageRef = StorageRef(fbStorage, `curbside-post_${docRef.id}`)
            uploadString(storageRef, imgDataUrl.value, 'data_url')
                .then(snapshot => {
                    console.debug('New Post added:', docRef.id, snapshot)
                    window.location.reload()
                })
                .catch(e => {
                    console.error('Error adding post:', e)
                    submitError.value = e
                    activelySaving.value = false
                })
        } catch (e) {
            console.error('Error adding post:', e)
            submitError.value = e
            activelySaving.value = false
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

    #close-icon {
        cursor: pointer;
    }

    .gallery-view {
        width: 100%;

        img {
            width: 100%;
        }
    }

    .postButton {
        width: 73px;
    }

    ion-icon.loading {
        animation: loading 1.5s linear infinite;
    }

    @keyframes loading {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .loadingText {
        font-size: 1.5rem;
    }

    .loadingContainer {
        min-height: 300px;
        display: flex;
        flex-flow: column;
        justify-content: center;

        & ion-icon {
            font-size: 4rem;
            margin-bottom: 2rem;
        }
    }

    .form {
        ion-row {
            margin-bottom: 1rem;
        }
    }

    .cameraGrid {
        margin-bottom: 1rem;
    }

    .inputRow {
        display: flex;
        flex-flow: column;
        margin-bottom: 2rem;
        font-weight: 600;
    }

    .submitText {
        padding-left: 10px;
        display: flex;
        align-items: center;

        .submitError {
            color: red;
        }
    }
</style>
