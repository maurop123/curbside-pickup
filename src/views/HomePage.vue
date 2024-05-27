<template>
    <ion-page>
        <ion-header :translucent="true">
            <app-navbar @openLogin="openLoginModal" />
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <app-navbar />
            </ion-header>

            <!-- Map -->
            <div id="container">
                <div id="map" ref="map" />
            </div>

            <!-- Listings -->
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
                <ion-fab-button @click="openNewPostModal">
                    <ion-icon :icon="addIcon" />
                </ion-fab-button>
            </ion-fab>

            <!-- Modals -->
            <LoginModal
                v-if="hasLoginModalOpened"
                :is-open="isLoginModalOpen"
                @dismiss="isLoginModalOpen = false"
            />
            <NewPostModal
                v-if="hasNewPostModalOpened"
                :is-open="isNewPostModalOpen"
                @dismiss="isNewPostModalOpen = false"
            />

            <!-- Action Sheet -->
            <ion-action-sheet trigger="logoutButton" :buttons="actionSheetButtons">
            </ion-action-sheet>

            <!-- Toast -->
            <ion-toast
                :is-open="toastIsOpen"
                message="You must be logged in to do that"
                :duration="toastLimit"
                position="bottom"
                :buttons="[
                    {
                        text: 'dismiss',
                        role: 'cancel',
                    },
                ]"
            />
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
    import {
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonFab,
        IonFabButton,
        IonIcon,
        IonButton,
        IonModal,
        IonGrid,
        IonRow,
        IonCol,
        IonToast,
    } from '@ionic/vue'
    import { add } from 'ionicons/icons'
    //leaflet
    import Leaflet from 'leaflet'
    import 'leaflet/dist/leaflet.css'
    import markerIconPng from 'leaflet/dist/images/marker-icon.png'
    import markerShadowPng from 'leaflet/dist/images/marker-shadow.png'
    //app
    import Listing from '@/components/ListingComponent.vue'
    import NewPostModal from '@/components/NewPostModal.vue'
    import LoginModal from '@/components/LoginModal.vue'
    import AppNavbar from '@/components/NavbarComponent.vue'
    import { useAppStore } from '@/stores/appStore'
    //auth
    import { signOut } from 'firebase/auth'
    import { auth } from '@/firebaseApp'
    import { useCurrentUser } from 'vuefire'
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
    const actionSheetButtons = [
        {
            text: 'Logout',
            handler: logout,
        },
    ]
    const addIcon: Ref<any> = ref(add)
    const hasLoginModalOpened: Ref<boolean> = ref(false)
    const isLoginModalOpen: Ref<boolean> = ref(false)
    const hasNewPostModalOpened: Ref<boolean> = ref(false)
    const isNewPostModalOpen: Ref<boolean> = ref(false)
    // @ts-ignore
    const listingRefs: Reactive<{}> = reactive({})
    const postsOrdered = computed(() => {
        const orderingPosts = posts.value.map(p => {
            p.distance = getDistance(p)
            return p
        })
        return _orderBy(posts.value, ['createdAt', 'distance'], ['desc', 'asc'])
    })
    const toastIsOpen: Ref<boolean> = ref(false)
    const toastLimit: number = 5000

    //
    // Methods
    //
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
        return Math.round((distance / 1000) * 0.6213712 * 10) / 10 // km to mi rounded to 1 decimal
    }

    function listingClicked(post: any) {
        console.debug('listingClicked', post)
        map.value.scrollIntoView()
        LMap.setView([post.latitude, post.longitude], 16)
    }

    function logout() {
        signOut(auth)
            .then(() => {
                console.debug('logged out')
            })
            .catch(err => {
                console.error(err)
            })
    }

    function markerClick(post: any) {
        console.debug('markerClick', post, listingRefs)
        listingRefs[post.id].scrollIntoView()
        listingRefs[post.id].setAttribute('class', 'selected')
        setTimeout(() => {
            listingRefs[post.id].setAttribute('class', '')
        }, 3000)
    }

    function openLoginModal() {
        hasLoginModalOpened.value = true
        isLoginModalOpen.value = true
    }

    function openNewPostModal() {
        console.debug('openNewPostModal', useCurrentUser().value)
        if (useCurrentUser().value === null) {
            toastIsOpen.value = true
            setTimeout(() => {
                toastIsOpen.value = false
            }, toastLimit)
        } else {
            hasNewPostModalOpened.value = true
            isNewPostModalOpen.value = true
        }
    }

    //
    // Lifecycle Hooks
    //
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

    // Add pins when posts load
    watch(posts, newPosts => {
        posts.value.forEach(post => {
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

    // Update map when coordiantes are in
    watch(currentLatLon, newCoords => {
        // delay to see animation
        setTimeout(() => {
            LMap.setView(currentLatLon.value, zoomLevel.value)
        }, 500)
    })

    // Geolocation permissions request
if (navigator?.permissions?.query) {
    console.debug('permissions obj', navigator.permissions)
    navigator.permissions.query({ name: 'geolocation' }).then(res => {
        console.log('permissions: query results', res)
        if (res.state === 'prompt') {
            getGeolocationPermission()
        } else if (res.state === 'granted') {
            getGeolocationPermission()
        }
    })
}
</script>

<style>
    ion-title {
        font-family: 'Lilita One', sans-serif;
        font-weight: 400;
        font-style: normal;
        font-size: 2rem;
        margin: 0 -0.5rem;
    }
</style>

<style scoped>
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
