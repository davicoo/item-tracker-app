import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from './LandingPage.vue';
import AppPage from './App.vue';

const routes = [
  { path: '/', name: 'Landing', component: LandingPage },
  { path: '/app', name: 'App', component: AppPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
