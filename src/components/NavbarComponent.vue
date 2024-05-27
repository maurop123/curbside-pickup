<template>
    <ion-toolbar class="flex justify-between">
        <ion-title slot="start">{{ navTitle }}</ion-title>
        <ion-buttons slot="end">
            <ion-button v-show="!isLoggedIn" @click="$emit('openLogin')">
                <ion-icon :icon="personCircle" class="mr-1"></ion-icon>
                <ion-text>Login</ion-text>
            </ion-button>
            <ion-button id="logoutButton" v-show="isLoggedIn">
                <ion-icon :icon="personCircle"></ion-icon>
            </ion-button>
        </ion-buttons>
    </ion-toolbar>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'
    import { IonButton, IonButtons, IonIcon, IonTitle, IonToolbar } from '@ionic/vue'
    import { personCircle } from 'ionicons/icons'
    import { useCurrentUser, useFirebaseAuth } from 'vuefire'

    //app
    const navTitle: string = 'Curbside Pickup'
    //vuefire
    const auth = useFirebaseAuth()
    const authError = ref(null)
    const isLoggedIn = computed(() => {
        return useCurrentUser().value !== null
    })

    console.debug('useCurrentUser', useCurrentUser().value)
</script>

<style scoped></style>
