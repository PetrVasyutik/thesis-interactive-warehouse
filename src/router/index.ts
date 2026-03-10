import { createRouter, createWebHistory } from 'vue-router';
import { RouterNames } from './routerNames';
import LoginPage from '@/components/pages/LoginPage.vue';
import ProfilePage from '@/components/pages/ProfilePage.vue';
import WarehousePage from '@/components/pages/WarehousePage.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { useAuthStore } from '@/store/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'profile',
          name: RouterNames.Profile,
          component: ProfilePage,
        },
        {
          path: 'warehouse',
          name: RouterNames.Warehouse,
          component: WarehousePage,
        },
      ],
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
