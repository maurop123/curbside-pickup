<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar class="flex justify-between">
                <ion-title slot="start">{{ navTitle }}</ion-title>
                <ion-buttons slot="end">
                    <ion-button>
                        <ion-icon slot="icon-only" :icon="personCircle"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar class="flex justify-between">
                    <ion-title slot="start">{{ navTitle }}</ion-title>
                    <ion-buttons slot="end">
                        <ion-button>
                            <ion-icon slot="icon-only" :icon="personCircle"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>

            <!-- Map -->
            <div id="container">
                <div id="map" ref="map" />
            </div>

            <div id="listings">
                <div
                    v-for="(post, i) in postsOrdered"
                    :ref="
                        el => {
                            listingRefs[post.id] = el
                        }
                    "
                >
                    <Listing
                        :post="post"
                        :distance="getDistance(post)"
                        @click="listingClicked(post)"
                    />
                </div>
            </div>

            <!-- Post Fab -->
            <ion-fab slot="fixed" vertical="bottom" horizontal="end" class="m-0.5">
                <ion-fab-button id="new-post">
                    <ion-icon :icon="addIcon" />
                </ion-fab-button>
            </ion-fab>

            <!-- Modal -->
            <ion-modal ref="modal" trigger="new-post">
                <ion-header>
                    <ion-toolbar class="cu-toolbar">
                        <ion-grid class="p-0">
                            <ion-row>
                                <ion-col size="10" class="p-0">
                                    <ion-title> New Post </ion-title>
                                </ion-col>
                                <ion-col size="2" class="text-right pt-2 pr-2">
                                    <ion-icon
                                        :icon="closeIcon"
                                        size="large"
                                        @click="closeModal()"
                                    ></ion-icon>
                                </ion-col>
                            </ion-row>
                        </ion-grid>
                    </ion-toolbar>
                </ion-header>
                <NewPostContent />
            </ion-modal>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
    //vue
    import { ref, reactive, computed, watch } from 'vue'
    import type { Ref } from 'vue'
    import { onMounted, onUpdated } from 'vue'
    import { storeToRefs } from 'pinia'
    //ionic
    import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue'
    import { IonFab, IonFabButton, IonIcon, IonButton } from '@ionic/vue'
    import { IonModal, IonGrid, IonRow, IonCol } from '@ionic/vue'
    import { add, close, personCircle } from 'ionicons/icons'
    //leaflet
    import Leaflet from 'leaflet'
    import 'leaflet/dist/leaflet.css'
    import markerIconPng from 'leaflet/dist/images/marker-icon.png'
    import markerShadowPng from 'leaflet/dist/images/marker-shadow.png'
    //app
    import Listing from '@/components/ListingComponent.vue'
    import NewPostContent from '@/components/NewPostModal.vue'
    import { useAppStore } from '@/stores/appStore'
    //misc
    import _orderBy from 'lodash/orderBy'

    //app store
    const appStore = useAppStore()
    const { currentLatLon, posts } = storeToRefs(appStore)
    //leaflet
    const map: Ref<any> = ref()
    const zoomLevel = ref(12)
    let LMap: any
    //page
    // @ts-ignore
    const listingRefs: Reactive<{}> = reactive({})
    const navTitle: string = 'Curbside Pickup'
    const postsOrdered = computed(() => {
        const orderingPosts = posts.value.map(p => {
            p.distance = getDistance(p)
            console.debug('p.distance', p.distance)
            return p
        })
        return _orderBy(posts.value, ['createdAt', 'distance'], ['desc', 'asc'])
    })

    onMounted(() => {
        // Set Map
        LMap = Leaflet.map(map.value).setView(currentLatLon.value, zoomLevel.value)
        Leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(LMap)

        // Fix map loadout
        setTimeout(() => {
            LMap.invalidateSize()
        }, 100)
    })

    function markerClick(post: any) {
        console.debug('markerClick', post, listingRefs)
        listingRefs[post.id].scrollIntoView()
        listingRefs[post.id].setAttribute('class', 'selected')
        setTimeout(() => {
            listingRefs[post.id].setAttribute('class', '')
        }, 3000)
    }

    // Add pins when posts load
    watch(posts, newPosts => {
        posts.value.forEach(post => {
            console.debug('Adding marker to', post)
            const lat = post?.latitude
            const lon = post?.longitude
            if (lat && lon) {
                Leaflet.marker([lat, lon], {
                    icon: Leaflet.icon({
                        iconUrl: markerIconPng,
                        shadowUrl: markerShadowPng,
                    }),
                })
                    .on('click', () => {
                        markerClick(post)
                    })
                    .addTo(LMap)
            } else {
                console.error('Could not find latitude or longitude for this post', post)
            }
        })
    })

    const addIcon = ref(add)
    const closeIcon = ref(close)

    const modal = ref(null)
    function closeModal() {
        console.log('close')
        if (modal !== null) {
            // @ts-ignore
            modal.value.$el.dismiss(null, 'cancel')
        }
    }

    // Geolocation permissions request
    console.debug('permissions obj', navigator.permissions)
    navigator.permissions.query({ name: 'geolocation' }).then(res => {
        console.log('permissions: query results', res)
        if (res.state === 'prompt') {
            getGeolocationPermission()
        } else if (res.state === 'granted') {
            getGeolocationPermission()
        }
    })

    function getGeolocationPermission() {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }

        navigator.geolocation.getCurrentPosition(
            pos => {
                const crd = pos.coords

                /* currentLatLon.value = [crd.latitude, crd.longitude] */
                appStore.coordinates.latitude = crd.latitude
                appStore.coordinates.longitude = crd.longitude

                console.log('Your current position is:')
                console.log(`Current Lat, Lon : ${currentLatLon.value}`)
                console.log(`More or less ${crd.accuracy} meters.`)
            },
            err => {
                console.warn(`ERROR(${err.code}): ${err.message}`)
            },
            options,
        )
    }

    function getDistance(post: any) {
        const distance = LMap.distance(currentLatLon.value, [post.latitude, post.longitude])
        console.debug('distance', distance)
        return Math.round((distance / 1000) * 0.6213712 * 10) / 10 // km to mi rounded to 1 decimal
    }

    function listingClicked(post: any) {
        console.debug('listingClicked', post)
        map.value.scrollIntoView()
        LMap.setView([post.latitude, post.longitude], 16)
    }

    // update map when coordiantes are in
    watch(currentLatLon, newCoords => {
        // delay to see animation
        setTimeout(() => {
            LMap.setView(currentLatLon.value, zoomLevel.value)
        }, 500)
    })
</script>

<style scoped>
    ion-title {
        font-family: 'Lilita One', sans-serif;
        font-weight: 400;
        font-style: normal;
        font-size: 2rem;
        margin: 0 -0.5rem;
    }

    ion-page {
        height: 100%;
    }

    #map {
        width: 100%;
        height: 400px;
    }

    @keyframes flash-listing {
        from {
            background-color: rgba(59, 130, 246, 0.4);
        }
        to {
            background-color: rgba(59, 130, 246, 0);
        }
    }

    .selected {
        animation: flash-listing 1.5s infinite;
    }
</style>
