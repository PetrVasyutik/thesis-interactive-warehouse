<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref('');

const MOCK_USER = { username: 'admin', password: 'admin123' };

const schema = yup.object({
  userName: yup.string().required('Введите логин'),
  password: yup.string().required('Введите пароль').min(6, 'Пароль не менее 6 символов'),
});

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: schema,
  initialValues: {
    userName: '',
    password: '',
  },
});

const [userNameAttr, userNameMeta] = defineField('userName');
const [passwordAttr, passwordMeta] = defineField('password');

const onSubmit = handleSubmit((values) => {
  errorMessage.value = '';
  if (values.userName === MOCK_USER.username && values.password === MOCK_USER.password) {
    authStore.login('fake-token-123');
    router.push('/warehouse');
  } else {
    errorMessage.value = 'Неверное имя пользователя или пароль';
  }
});

function handleLogout() {
  authStore.logout();
};
</script>

<template>
  <div>
    <h1>Страница входа</h1>
    <form @submit.prevent="onSubmit">
      <div>
        <label for="username">Логин</label>
        <input
          id="username"
          v-model="userNameAttr"
          v-bind="userNameMeta"
          type="text"
          autocomplete="username"
        />
        <p v-if="errors.userName" style="color: red">{{ errors.userName }}</p>
      </div>
      <div>
        <label for="password">Пароль</label>
        <input
          id="password"
          v-model="passwordAttr"
          v-bind="passwordMeta"
          type="password"
          autocomplete="current-password"
        />
      </div>
      <button type="submit">Войти</button>
      <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    </form>

    <hr />
    <button @click="handleLogout">Выйти</button>
    <button type="button" @click="router.push('/warehouse')">На склад</button>

    <div>
      <p>Статус: {{ authStore.isAuthenticated ? 'Залогинен' : 'Не залогинен' }}</p>
      <p>Токен: {{ authStore.token || 'Нет токена' }}</p>
    </div>
  </div>
</template>
