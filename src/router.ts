import { createRouter, createWebHistory } from 'vue-router';
import AppPage from './App.vue';

const routes = [
  { path: '/', name: 'App', component: AppPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
