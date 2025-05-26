import { createApp } from 'vue'
import App from './App.vue'
import ImageKitVue from '@imagekit/vue'
import './assets/main.css'

const app = createApp(App)

app.use(ImageKitVue, {
  publicKey: 'public_8RxT918PPFr+aU5aqwgMZx/waIU=',
  urlEndpoint: 'https://ik.imagekit.io/mydwcapp',
  authenticationEndpoint: 'https://myinvtory.netlify.app/.netlify/functions/auth'
})

app.mount('#app')