<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar class="cu-toolbar">
                <ion-title>{{ navTitle }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar class="cu-toolbar">
                    <ion-title size="large">{{ navTitle }}</ion-title>
                </ion-toolbar>
            </ion-header>

            <div id="container">
                <div id="map" ref="map" />
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
                                    <ion-title> New Posting </ion-title>
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
    import { ref, watch } from 'vue'
    import { onMounted, onUpdated } from 'vue'
    import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue'
    import { IonFab, IonFabButton, IonIcon, IonButton } from '@ionic/vue'
    import { IonModal, IonGrid, IonRow, IonCol } from '@ionic/vue'
    import { add, close } from 'ionicons/icons'
    import L from 'leaflet'
    import 'leaflet/dist/leaflet.css'
    import NewPostContent from '@/components/NewPostModal.vue'

    const navTitle = 'Curbside Pickup'

    const currentLatLon = ref([39.73915, -104.9847])
    const map = ref(null)
    let LMap
    onMounted(() => {
        // Set Map
        LMap = L.map(map.value).setView(currentLatLon.value, 13)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(LMap)

        // Fix map loadout
        setTimeout(() => {
            LMap.invalidateSize()
        }, 100)
    })

    const addIcon = ref(add)
    const closeIcon = ref(close)

    const modal = ref(null)
    function closeModal() {
        console.log('close')
        modal.value.$el.dismiss(null, 'cancel')
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

                console.log('Your current position is:')
                currentLatLon.value = [crd.latitude, crd.longitude]
                console.log(`Current Lat, Lon : ${currentLatLon.value}`)
                console.log(`More or less ${crd.accuracy} meters.`)
            },
            err => {
                console.warn(`ERROR(${err.code}): ${err.message}`)
            },
            options,
        )
    }

    // update map when coordiantes are in
    watch(currentLatLon, async (newCoords, oldCoords) => {
        LMap.setView(currentLatLon.value, 13)
    })
</script>

<style scoped>
    .cu-toolbar {
        ion-title {
            font-family: 'Lilita One', sans-serif;
            font-weight: 400;
            font-style: normal;
            font-size: 2rem;
            margin: 0 -0.5rem;
        }
    }

    ion-page {
        height: 100%;
    }

    #map {
        height: 400px;
        width: 600px;
        border: 1px solid black;
    }
</style>
