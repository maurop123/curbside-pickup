import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import { IonicVue } from '@ionic/vue'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Theme variables */
import './theme/variables.css'

/* Tailwind */
import './assets/tailwind.css'

/* Base styls */
import './assets/base.css'

import { initializeApp } from 'firebase/app'
import { VueFire } from 'vuefire'

const firebaseConfig = {
    apiKey: 'AIzaSyBK1UxxKvK8UKbhz6Ez0ZizY0FomHLCuFs',
    authDomain: 'mauro-made-it.firebaseapp.com',
    databaseURL: 'https://mauro-made-it.firebaseio.com',
    projectId: 'mauro-made-it',
    storageBucket: 'mauro-made-it.appspot.com',
    messagingSenderId: '175419399994',
    appId: '1:175419399994:web:53bd17fb1a2540a0bffa03',
}
const firebaseApp = initializeApp(firebaseConfig)

const rootStore = createPinia()
const app = createApp(App).use(IonicVue).use(router).use(VueFire, {
    firebaseApp,
})

router.isReady().then(() => {
    app.use(rootStore)
    app.mount('#app')
})
