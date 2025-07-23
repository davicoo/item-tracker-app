import { createRouter, createWebHistory } from 'vue-router';
import AppPage from './App.vue';
import UserProfile from './UserProfile.vue';
import EditProfile from './EditProfile.vue';

const routes = [
  { path: '/', name: 'App', component: AppPage },
  { path: '/profile', name: 'Profile', component: UserProfile },
  { path: '/profile/edit', name: 'EditProfile', component: EditProfile },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
