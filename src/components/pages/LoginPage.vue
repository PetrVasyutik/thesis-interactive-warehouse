<script setup lang="ts">
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();

function handleLogin() {
  authStore.login('fake-token-123');
};

function handleLogout() {
  authStore.logout();
};
</script>

<template>
  <div>
    <h1>Страница входа</h1>
    <button @click="handleLogin">Войти</button>
    <button @click="handleLogout">Выйти</button>
    <button @click="$router.push('/warehouse')">На склад</button>

    <div>
      <p>Статус: {{ authStore.isAuthenticated ? 'Залогинен' : 'Не залогинен' }}</p>
      <p>Токен: {{ authStore.token || 'Нет токена' }}</p>
    </div>
  </div>
</template>
