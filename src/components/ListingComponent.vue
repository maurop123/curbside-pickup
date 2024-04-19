<template>
    <ion-grid>
        <ion-row>
            <ion-col size="4">
                <img ref="listingImage" />
            </ion-col>
            <ion-col size="8" class="flex flex-col justify-between">
                <!-- distance away -->
                <p class="text-sm font-semibold">
                    {{ props.distance }} mi away (<span class="text-xs text-gray-500"
                        >Condition: <span class="text-blue-500">{{ conditionText }}</span></span
                    >)
                </p>

                <p>
                    {{ props.post.description }}
                </p>
                <!-- condition -->

                <!-- time since posted -->
                <p class="text-xs text-gray-500">Posted {{ postDate }}</p>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'
    import type { Ref } from 'vue'
    import { collection } from 'firebase/firestore'
    import { getStorage, ref as fbRef, getDownloadURL } from 'firebase/storage'
    import { formatDistance } from 'date-fns'

    //app
    const props = defineProps(['post', 'distance'])
    console.debug('Listing props', props.post)
    const listingImage = ref()
    //firebase
    const storage = getStorage()
    const pathRef = fbRef(storage, `curbside-post_${props.post.id}`)

    getDownloadURL(pathRef).then(url => {
        listingImage.value.setAttribute('src', url)
    })

    const postDate = computed(() => {
        console.debug('postDate', props.post.createdAt)
        return formatDistance(new Date(props.post.createdAt), new Date(), { addSuffix: true })
    })

    // Copy and pasted from NewPostModal
    const conditionText = computed(() => {
        const val = props.post.condition
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
</script>

<style scoped></style>
