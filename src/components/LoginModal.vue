<template>
    <ion-modal>
        <ion-header>
            <ion-toolbar>
                <ion-grid class="p-0">
                    <ion-row>
                        <ion-col size="10" class="p-0">
                            <ion-title v-if="!createAccount"> Login </ion-title>
                            <ion-title v-else> Signup </ion-title>
                        </ion-col>
                        <ion-col size="2" class="text-right pt-2 pr-2">
                            <ion-icon
                                id="close-icon"
                                :icon="closeIcon"
                                size="large"
                                @click="$emit('dismiss')"
                            ></ion-icon>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid v-show="!loading">
                <ion-row>
                    <ion-col size="12">
                        <ion-input
                            label="Email"
                            label-placement="stacked"
                            placeholder="youremail@domain.com"
                            v-model="email"
                        ></ion-input>
                        <ion-input
                            label="Password"
                            label-placement="stacked"
                            placeholder="********"
                            v-model="password"
                            type="password"
                        ></ion-input>
                        <ion-button v-if="!createAccount" @click="login">
                            <ion-text> Login </ion-text>
                        </ion-button>
                        <ion-button v-else @click="signup">
                            <ion-text> Signup </ion-text>
                        </ion-button>
                    </ion-col>
                    <ion-col size="12" class="text-sm" v-if="!createAccount">
                        Don't have an account? <a href="#" @click="goToSignup">Sign up</a>
                    </ion-col>
                    <ion-col size="12" class="text-sm" v-else>
                        Already have an account? <a href="#" @click="goToLogin">Log in</a>
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid v-show="loading">
                <ion-spinner />
            </ion-grid>
        </ion-content>
    </ion-modal>
</template>

<script setup lang="ts">
    //vue
    import { defineEmits, ref } from 'vue'
    import type { Ref } from 'vue'
    //ionic
    import {
        IonContent,
        IonGrid,
        IonRow,
        IonCol,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonIcon,
        IonButton,
        IonText,
        IonInput,
        IonSpinner,
        IonModal,
    } from '@ionic/vue'
    import { close } from 'ionicons/icons'
    //auth
    import { auth } from '@/firebaseApp'
    import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

    //login
    const createAccount: Ref<boolean> = ref(false)
    const loading: Ref<boolean> = ref(false)
    const email: Ref<string> = ref('')
    const password: Ref<string> = ref('')
    //modal
    const closeIcon = ref(close)
    const emit = defineEmits(['dismiss'])

    function goToSignup(e: MouseEvent) {
        console.debug('goToSignup', e)
        e.preventDefault()
        createAccount.value = true
    }

    function goToLogin(e: MouseEvent) {
        e.preventDefault()
        createAccount.value = false
    }

    function login() {
        loading.value = true
        if (!validateEmail(email.value)) {
            console.error('Invalid email')
            console.debug(email.value)
            loading.value = false
        } else if (!validatePassword(password.value)) {
            console.error('Invalid password')
            console.debug(password.value)
            loading.value = false
        } else {
            signInWithEmailAndPassword(auth, email.value, password.value)
                .then(userCredential => {
                    loading.value = false
                    console.debug('userCredential', userCredential)
                    emit('dismiss')
                })
                .catch(err => {
                    console.error(err)
                    loading.value = false
                })
        }
    }

    function signup() {
        loading.value = true
        if (!validateEmail(email.value)) {
            console.error('Invalid email')
            console.debug(email.value)
            loading.value = false
        } else if (!validatePassword(password.value)) {
            console.error('Invalid password')
            console.debug(password.value)
            loading.value = false
        } else {
            createUserWithEmailAndPassword(auth, email.value, password.value)
                .then(userCredential => {
                    loading.value = false
                    console.debug('userCredential', userCredential)
                    login()
                })
                .catch(err => {
                    loading.value = false
                    console.error(err)
                })
        }
    }

    function validateEmail(str: string) {
        return str.length > 0
    }

    function validatePassword(str: string) {
        return str.length > 0
    }
</script>

<style scoped>
    a {
        color: var(--ion-color-primary, #3880ff);

        &:hover {
            text-decoration: underline;
        }
    }

    #close-icon {
        cursor: pointer;
    }
</style>
