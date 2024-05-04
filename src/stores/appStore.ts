import { computed } from 'vue'
import { defineStore } from 'pinia'
//firebase
import { useFirestore, useCollection } from 'vuefire'
import { collection } from 'firebase/firestore'
//leaflet
import Leaflet from 'leaflet'

interface Coordinates {
    latitude: number
    longitude: number
}

export const useAppStore = defineStore('app', () => {
    const coordinates: reactive<Coordinates> = {
        latitude: 39.748781,
        longitude: -105.046194,
    }

    const currentLatLon: Leaflet.LatLngTuple = computed(state => [
        coordinates.latitude,
        coordinates.longitude,
    ])

    return {
        coordinates,
        currentLatLon,
    }
})
