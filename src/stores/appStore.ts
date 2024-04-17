import { defineStore } from 'pinia'

interface AppStore {
    coordinates: {
        latitude: number
        longitude: number
    }
}

export const useAppStore = defineStore('app', {
    state: (): AppStore => ({
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
