<template>
    <ion-toolbar class="flex justify-between">
        <ion-title slot="start">{{ navTitle }}</ion-title>
        <ion-buttons slot="end">
            <ion-button id="loginButton">
                <ion-text v-if="!isLoggedIn">Signup / Login</ion-text>
                <ion-icon v-else :icon="personCircle"></ion-icon>
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
