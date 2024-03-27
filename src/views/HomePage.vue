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
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
	import { ref, watch } from 'vue'
	import { onMounted, onUpdated } from 'vue'
	import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue'
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

	/* Default */
	#container {
		text-align: center;

		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
	}

	#container strong {
		font-size: 20px;
		line-height: 26px;
	}

	#container p {
		font-size: 16px;
		line-height: 22px;

		color: #8c8c8c;

		margin: 0;
	}

	#container a {
		text-decoration: none;
	}
</style>
