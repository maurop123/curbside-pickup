//vue
import { computed } from 'vue'
import type { Ref } from 'vue'
//firebase & vuefire
import { db } from '@/firebaseApp'
import { collection } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'
//leaflet
import Leaflet from 'leaflet'
//pinia
import { defineStore } from 'pinia'

interface Coordinates {
    latitude: number
    longitude: number
}

export const useAppStore = defineStore('app', () => {
    const coordinates = {
        latitude: 39.748781,
        longitude: -105.046194,
    }

    const currentLatLon = computed<Leaflet.LatLngTuple>(state => [
        coordinates.latitude,
        coordinates.longitude,
    ])

    const posts = useCollection(collection(db, 'curbside-posts'))

    return {
        coordinates,
        currentLatLon,
        posts,
    }
})
