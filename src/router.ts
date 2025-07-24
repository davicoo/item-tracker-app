import { createRouter, createWebHistory } from 'vue-router';
import AppPage from './App.vue';
import UserProfile from './UserProfile.vue';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/pages/LandingPage.vue'),
  },
  { path: '/app', name: 'App', component: AppPage },
  { path: '/profile', name: 'Profile', component: UserProfile },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
