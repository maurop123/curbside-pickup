import { defineStore } from 'pinia'

interface AppStore {
    coordinates: {
        latitude: number
        longitude: number
    }
    collectionName: string
}

export const useAppStore = defineStore('app', {
    state: (): AppStore => ({
        collectionName: 'curbside-posts',
        coordinates: {
            latitude: 39.748781,
            longitude: -105.046194,
        },
    }),
    getters: {
        currentLatLon(state) {
            return [state.coordinates.latitude, state.coordinates.longitude]
        },
    },
})
