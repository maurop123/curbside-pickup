<template>
    <ion-grid class="pt-0 pl-0">
        <ion-row>
            <ion-col size="4" class="pt-0 pl-0">
                <img ref="listingImage" />
            </ion-col>
            <ion-col size="8" class="flex flex-col justify-between">
                <!-- distance -->
                <p class="text-sm font-semibold">{{ props.distance }} mi away</p>

                <!-- description -->
                <p>
                    {{ props.post.description }}
                </p>

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
</script>

<style scoped></style>
