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
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

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
</style>
