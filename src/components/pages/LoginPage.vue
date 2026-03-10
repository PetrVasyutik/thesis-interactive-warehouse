<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { QInput, QBtn, QCard, QCardSection } from 'quasar';

const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();
const errorMessage = ref('');

const isPwd = ref(true);

const MOCK_USER = { username: 'admin', password: 'admin123' };

const { t } = useI18n();

const schema = yup.object({
  userName: yup.string().required(t('login.errorRequiredLogin')),
  password: yup
    .string()
    .required(t('login.errorRequiredPassword'))
    .min(6, t('login.errorPasswordMin')),
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

const currentYear = new Date().getFullYear();

const onSubmit = handleSubmit((values) => {
  errorMessage.value = '';
  if (values.userName === MOCK_USER.username && values.password === MOCK_USER.password) {
    userStore.setUser(
      'Иван',
      'admin@example.com',
      'Иванов Иван Иванович',
      '+72345678900',
      'Отдел учета',
      'Кладовщик',
    );
    authStore.login('fake-token-123');
    router.push('/profile');
  } else {
    errorMessage.value = t('login.errorInvalidCredentials');
  }
});
</script>

<template>
  <div class="login-page">
    <q-card class="login-card" flat bordered>
      <q-card-section class="q-pa-lg">
        <h1 class="q-mt-none q-md-mb text-primary">{{ $t('login.title') }}</h1>
        <form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input
            v-model="userNameAttr"
            v-bind="userNameMeta"
            outlined
            :label="$t('login.loginLabel')"
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
            :label="$t('login.passwordLabel')"
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
              :label="$t('login.submit')"
              unelevated
              class="full-width"
            />
          </div>
          <p v-if="errorMessage" class="text-negative q-mt-sm">{{ errorMessage }}</p>
        </form>
      </q-card-section>
    </q-card>
    <footer class="login-footer">
      <span class="login-footer__copyright">
        © {{ currentYear }} {{ $t('common.appTitle') }}
      </span>
      <span class="login-footer__theme">
        {{ $t('common.appSubtitle') }}
      </span>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 1240px;
  max-width: 1920px;
}

.login-card {
  margin-top: 50px;
}

.login-footer {
  margin-top: auto;
  width: 100%;
  padding: 12px 24px;
  background-color: #f5f5f5;
  color: #666;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.login-footer__copyright {
  font-weight: 500;
}

.login-footer__theme {
  opacity: 0.9;
}
</style>
