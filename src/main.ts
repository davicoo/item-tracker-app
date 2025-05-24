import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'

const imageKitConfig = {
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
  transformationPosition: "path"
};

createApp(App).mount('#app')
