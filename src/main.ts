import { createApp } from 'vue'
import router from './router'
import AppRoot from './AppRoot.vue'
import * as ImageKitVue from '@imagekit/vue'  // Namespace import
import 'preline/dist/preline'
import '@preline/datepicker'
import _ from 'lodash'
// import { Datepicker } from 'preline' // Optional: manual init

const app = createApp(AppRoot)

// Expose lodash for Preline plugins that expect global `_`
(window as any)._ = _

app.use(router)

app.use(ImageKitVue, {
  publicKey: 'public_8RxT918PPFr+aU5aqwgMZx/waIU=',
  urlEndpoint: 'https://ik.imagekit.io/mydwcapp',
  authenticationEndpoint: 'https://myinvtory.netlify.app/.netlify/functions/auth'
})

app.mount('#app')
