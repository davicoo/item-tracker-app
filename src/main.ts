import { createApp } from 'vue'
import router from './router'
import AppRoot from './AppRoot.vue'
import 'preline/dist/preline'
import _ from 'lodash'
// import { Datepicker } from 'preline' // Optional: manual init

const app = createApp(AppRoot);

// Expose lodash for Preline plugins that expect global `_`
(window as any)._ = _;

app.use(router);

router.isReady().then(() => {
  app.mount('#app');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.error('Service worker registration failed:', err);
    });
  });
}

