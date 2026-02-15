<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="main-layout q-pa-lg">
        <q-btn
          color="primary"
          label="Выйти"
          @click="handleLogout"
        >
        </q-btn>
    </q-header>
    <q-page-container>
      <router-view />
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

const currentYear = new Date().getFullYear();

function handleLogout() {
  authStore.logout();
  userStore.clearUser();
  router.push({ name: 'login' });
}
</script>
<style lang="scss" scoped>
.main-layout {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: white;
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
</style>
