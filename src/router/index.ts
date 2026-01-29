import { createRouter, createWebHistory } from 'vue-router';
import { RouterNames } from './routerNames';
import LoginPage from '@/components/pages/LoginPage.vue';
import ProfilePage from '@/components/pages/ProfilePage.vue';
import WarehousePage from '@/components/pages/WarehousePage.vue';
import { useAuthStore } from '@/store/authStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: RouterNames.Login,
      component: LoginPage,
    },
    {
      path: '/profile',
      name: RouterNames.Profile,
      component: ProfilePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/warehouse',
      name: RouterNames.Warehouse,
      component: WarehousePage,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: RouterNames.Login });
  } else {
    next();
  }
});

export default router;
