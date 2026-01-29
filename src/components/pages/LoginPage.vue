<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';

const authStore = useAuthStore();
const router = useRouter();

const userName = ref('');
const password = ref('');
const errorMessage = ref('');

const MOCK_USER = { username: 'admin', password: 'admin123' };

function handleLogin() {
  errorMessage.value = '';
  if (userName.value === MOCK_USER.username && password.value === MOCK_USER.password) {
    authStore.login('fake-token-123');
    router.push('/warehouse');
  } else {
    errorMessage.value = 'Неверное имя пользователя или пароль';
  }
};

function handleLogout() {
  authStore.logout();
};
</script>

<template>
  <div>
    <h1>Страница входа</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="username">Логин</label>
        <input id="username" v-model="userName" type="text" autocomplete="username" />
      </div>
      <div>
        <label for="password">Пароль</label>
        <input id="password" v-model="password" type="password" autocomplete="current-password" />
      </div>
      <button type="submit">Войти</button>
      <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    </form>

    <hr />
    <button @click="handleLogin">Войти</button>
    <button @click="handleLogout">Выйти</button>
    <button type="button" @click="router.push('/warehouse')">На склад</button>

    <div>
      <p>Статус: {{ authStore.isAuthenticated ? 'Залогинен' : 'Не залогинен' }}</p>
      <p>Токен: {{ authStore.token || 'Нет токена' }}</p>
    </div>
  </div>
</template>
