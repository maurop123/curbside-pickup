<template>
    <ion-toolbar class="flex justify-between">
        <ion-title slot="start">{{ navTitle }}</ion-title>
        <ion-buttons slot="end">
            <ion-button>
                <ion-icon slot="icon-only" :icon="personCircle"></ion-icon>
            </ion-button>
        </ion-buttons>
    </ion-toolbar>
</template>

<script setup lang="ts">
    import { IonButton, IonButtons, IonIcon, IonTitle, IonToolbar } from '@ionic/vue'
    import { personCircle } from 'ionicons/icons'
    const navTitle: string = 'Curbside Pickup'
</script>

<style scoped></style>
