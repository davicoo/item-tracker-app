import { createApp } from 'vue'
import App from './App.vue'
import { IKContext } from '@imagekit/vue'
import './assets/main.css'

const app = createApp(App)

// Register the IKContext component globally
app.component('IKContext', IKContext)

app.mount('#app')