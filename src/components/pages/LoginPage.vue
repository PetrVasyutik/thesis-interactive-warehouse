<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { QInput, QBtn, QCard, QCardSection } from 'quasar';

const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref('');

const isPwd = ref(true);

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
    <q-card class="login-card" flat bordered>
      <q-card-section class="q-pa-lg">
        <h1 class="q-mt-none q-md-mb text-primary">Вход в систему</h1>
        <form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input
            v-model="userNameAttr"
            v-bind="userNameMeta"
            outlined
            label="Логин"
            type="text"
            autocomplete="username"
            :error="!!errors.userName"
            :error-message="errors.userName"
            class="q-mb-sm"
          />
          <q-input
            v-model="passwordAttr"
            v-bind="passwordMeta"
            outlined
            label="Пароль"
            :type="isPwd ? 'password' : 'text'"
            autocomplete="current-password"
            :error="!!errors.password"
            :error-message="errors.password"
            class="q-mb-sm"
          >
            <template #append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <div class="flex justify-center">
            <q-btn
              type="submit"
              color="primary"
              label="Войти"
              unelevated
              class="full-width"
            />
          </div>
          <p v-if="errorMessage" class="text-negative q-mt-sm">{{ errorMessage }}</p>
        </form>
      </q-card-section>
    </q-card>
  </div>
</template>
