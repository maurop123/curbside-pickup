<template>
	<ion-page>
		<ion-header :translucent="true">
			<ion-toolbar>
				<ion-title>{{ navTitle }}</ion-title>
			</ion-toolbar>
		</ion-header>

		<ion-content :fullscreen="true">
			<ion-header collapse="condense">
				<ion-toolbar>
					<ion-title size="large">{{ navTitle }}</ion-title>
				</ion-toolbar>
			</ion-header>

			<div id="container">
				<div id="map" ref="map" />
			</div>

			<!-- Post Fab -->
			<div>
				<ion-fab>
					<ion-fab-button>
						<ion-icon :icon="addIcon" />
					</ion-fab-button>
				</ion-fab>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
	import { ref, watch } from 'vue'
	import { onMounted, onUpdated } from 'vue'
	import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue'
	import { IonFab, IonFabButton, IonIcon } from '@ionic/vue'
	import { add } from 'ionicons/icons'
	import L from 'leaflet'
	import 'leaflet/dist/leaflet.css'

	const navTitle = 'Curbside Pickup'

	const map = ref(null)
	let LMap
	onMounted(() => {
		// Set Map
		LMap = L.map(map.value).setView([39.73915, -104.9847], 13)
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(LMap)

		// Fix map loadout
		setTimeout(() => {
			LMap.invalidateSize()
		}, 100)
	})

	const addIcon = ref(add)
</script>

<style scoped>
	ion-title {
		font-family: 'Lilita One', sans-serif;
		font-weight: 400;
		font-style: normal;
		font-size: 2rem;
	}

	#map {
		height: 400px;
		width: 600px;
		border: 1px solid black;
	}
</style>
