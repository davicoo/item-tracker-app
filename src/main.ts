import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import ImageKit from 'imagekitio-vue'

const app = createApp(App)

// Configure ImageKit globally
app.use(ImageKit, {
  publicKey: "public_8RxT918PPFr+aU5aqwgMZx/waIU=",
  urlEndpoint: "https://ik.imagekit.io/mydwcapp",
  authenticationEndpoint: "https://myinvtory.netlify.app/.netlify/functions/auth"
})

app.mount('#app')
