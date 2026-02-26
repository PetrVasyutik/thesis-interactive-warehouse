<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="main-layout q-pa-lg">
      <div class="main-layout__header-inner">
        <q-btn
          v-if="route.name !== RouterNames.Profile"
          color="primary"
          label="Личный кабинет"
          @click="goToProfile"
        />
        <q-btn
          color="primary"
          label="Выйти"
          @click="handleLogout"
        />
      </div>
    </q-header>
    <q-page-container>
      <RouterView v-slot="{ Component, route }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" :key="route.name ?? route.path" />
        </Transition>
      </RouterView>
    </q-page-container>
    <q-footer class="main-footer">
      <div class="main-footer__inner">
        <span class="main-footer__copyright">© {{ currentYear }} Интерактивный склад</span>
        <span class="main-footer__theme">Визуализация складских помещений</span>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { RouterNames } from '@/router/routerNames';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();

const currentYear = new Date().getFullYear();

function goToProfile() {
  router.push({ name: RouterNames.Profile });
}

function handleLogout() {
  authStore.logout();
  userStore.clearUser();
  router.push({ name: RouterNames.Login });
}
</script>
<style lang="scss" scoped>
.main-layout {
  background-color: white;
}

.main-layout__header-inner {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
}

.main-footer {
  background-color: #f5f5f5;
  color: #666;
  padding: 12px 24px;
}

.main-footer__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 1200px;
  margin: 0 auto;
  font-size: 13px;
}

.main-footer__copyright {
  font-weight: 500;
}

.main-footer__theme {
  opacity: 0.9;
}

:deep(.page-fade-enter-active),
:deep(.page-fade-leave-active) {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

:deep(.page-fade-enter-from),
:deep(.page-fade-leave-to) {
  opacity: 0;
  transform: translateY(8px);
}
</style>
