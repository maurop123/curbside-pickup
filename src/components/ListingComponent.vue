<template>
    <ion-grid>
        <ion-row>
            <ion-col size="4">
                <img ref="listingImage" />
            </ion-col>
            <ion-col size="8">
                <p>
                    Latitude {{ props.post.latitude }}<br />
                    Longitude {{ props.post.longitude }}
                </p>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { collection } from 'firebase/firestore'
    import { getStorage, ref as fbRef, getDownloadURL } from 'firebase/storage'

    //app
    const props = defineProps(['post'])
    const listingImage: Ref<HTMLElement | null> = ref(null)
    //firebase
    const storage = getStorage()
    const pathRef = fbRef(storage, `curbside-post_${props.post.id}`)
    getDownloadURL(pathRef).then(url => {
        listingImage.value.setAttribute('src', url)
    })

    console.debug('Listing props', props.post)
</script>

<style scoped></style>
