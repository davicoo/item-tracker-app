import { createApp } from 'vue'
import router from './router'
import AppRoot from './AppRoot.vue'
import * as ImageKitVue from '@imagekit/vue'  // Namespace import
import 'vanillajs-datepicker/css/datepicker.min.css'
import 'preline/preline'
// import { Datepicker } from 'preline' // Optional: manual init

const app = createApp(AppRoot)

app.use(router)

app.use(ImageKitVue, {
  publicKey: 'public_8RxT918PPFr+aU5aqwgMZx/waIU=',
  urlEndpoint: 'https://ik.imagekit.io/mydwcapp',
  authenticationEndpoint: 'https://myinvtory.netlify.app/.netlify/functions/auth'
})

app.mount('#app')
