import { createRouter, createWebHistory } from 'vue-router';
import AppPage from './App.vue';
import SettingsPage from './SettingsPage.vue';
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
  {
    path: '/store/login',
    name: 'StoreLogin',
    component: () => import('@/pages/StoreLoginPage.vue'),
  },
  {
    path: '/store/signup',
    name: 'StoreSignup',
    component: () => import('@/pages/StoreSignupPage.vue'),
  },
  {
    path: '/store',
    name: 'StoreDashboard',
    component: () => import('@/pages/StoreDashboardPage.vue'),
  },
  { path: '/app', name: 'App', component: AppPage },
  { path: '/settings', name: 'Settings', component: SettingsPage },
  {
    path: '/sold-details',
    name: 'SoldDetails',
    component: () => import('@/pages/SoldDetailsPage.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const { data } = await supabase.auth.getSession();
  const isAuthenticated = !!data.session;

  if (to.path.startsWith('/store') && !['/store/login', '/store/signup'].includes(to.path)) {
    if (!isAuthenticated) {
      next('/store/login');
    } else {
      next();
    }
  } else if (!isAuthenticated && ['/app', '/settings', '/sold-details'].includes(to.path)) {
    next('/login');
  } else if (isAuthenticated && (to.path === '/login' || to.path === '/signup')) {
    next('/app');
  } else if (isAuthenticated && to.path === '/store/login') {
    next('/store');
  } else {
    next();
  }
});

export default router;
