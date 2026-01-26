import { createRouter, createWebHistory } from 'vue-router';
import { RouterNames } from './routerNames';
import LoginPage from '@/components/pages/LoginPage.vue';
import ProfilePage from '@/components/pages/ProfilePage.vue';
import WarehousePage from '@/components/pages/WarehousePage.vue';

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
    },
    {
      path: '/warehouse',
      name: RouterNames.Warehouse,
      component: WarehousePage,
    },
  ],
});

export default router;
