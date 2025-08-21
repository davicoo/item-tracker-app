import { createRouter, createWebHistory } from 'vue-router';
import AppPage from './App.vue';
import UserProfile from './UserProfile.vue';
import SoldDetails from './SoldDetails.vue';
import { supabase } from './supabaseClient';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/pages/LandingPage.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/pages/SignupPage.vue'),
  },
  { path: '/app', name: 'App', component: AppPage },
  { path: '/profile', name: 'Profile', component: UserProfile },
  { path: '/sold-details', name: 'SoldDetails', component: SoldDetails },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const { data } = await supabase.auth.getSession();
  const isAuthenticated = !!data.session;

  if (
    !isAuthenticated &&
    (to.path === '/app' || to.path === '/profile' || to.path === '/sold-details')
  ) {
    next('/login');
  } else if (isAuthenticated && (to.path === '/login' || to.path === '/signup')) {
    next('/app');
  } else {
    next();
  }
});

export default router;
