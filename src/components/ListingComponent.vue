<template>
    <ion-grid>
        <ion-row>
            <ion-col size="4">
                <img ref="listingImage" />
            </ion-col>
            <ion-col size="8" class="flex flex-col justify-between">
                <!-- distance away -->

                <p>
                    {{ props.post.description }}
                </p>
                <!-- condition -->

                <!-- time since posted -->
                <p class="text-sm text-gray-500">Posted {{ postDate }}</p>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'
    import { collection } from 'firebase/firestore'
    import { getStorage, ref as fbRef, getDownloadURL } from 'firebase/storage'
    import { formatDistance } from 'date-fns'

    //app
    const props = defineProps(['post'])
    console.debug('Listing props', props.post)
    const listingImage: Ref<HTMLElement | null> = ref(null)
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
