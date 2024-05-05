import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const config = {
    apiKey: 'AIzaSyBK1UxxKvK8UKbhz6Ez0ZizY0FomHLCuFs',
    authDomain: 'mauro-made-it.firebaseapp.com',
    databaseURL: 'https://mauro-made-it.firebaseio.com',
    projectId: 'mauro-made-it',
    storageBucket: 'mauro-made-it.appspot.com',
    messagingSenderId: '175419399994',
    appId: '1:175419399994:web:53bd17fb1a2540a0bffa03',
}

export const app = initializeApp(config)
export const auth = getAuth(app)
export const db = getFirestore(app)
