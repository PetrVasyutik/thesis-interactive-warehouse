<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="main-layout q-pa-lg">
      <div class="main-layout__header-inner">
        <div class="main-layout__header-left">
          <q-btn
            v-if="route.name !== RouterNames.Profile"
            color="primary"
            :label="$t('common.profile')"
            @click="goToProfile"
          />
        </div>
        <div class="main-layout__header-right">
          <q-btn
            color="primary"
            no-caps
            class="main-layout__lang-toggle"
            @click="toggleLocale"
          >
            {{ locale === 'ru' ? 'EN' : 'RU' }}
          </q-btn>
          <q-btn
            color="primary"
            :label="$t('common.logout')"
            @click="handleLogout"
          />
        </div>
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
        <span class="main-footer__copyright">
          © {{ currentYear }} {{ $t('common.appTitle') }}
        </span>
        <span class="main-footer__theme">
          {{ $t('common.appSubtitle') }}
        </span>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { RouterNames } from '@/router/routerNames';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();

const { locale } = useI18n();

const currentYear = new Date().getFullYear();

function goToProfile() {
  router.push({ name: RouterNames.Profile });
}

function handleLogout() {
  authStore.logout();
  userStore.clearUser();
  router.push({ name: RouterNames.Login });
}

function toggleLocale() {
  locale.value = locale.value === 'ru' ? 'en' : 'ru';
}
</script>
<style lang="scss" scoped>
.main-layout {
  background-color: white;
}

.main-layout__header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.main-layout__header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-layout__lang-toggle {
  min-width: auto;
  padding: 0 12px;
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
