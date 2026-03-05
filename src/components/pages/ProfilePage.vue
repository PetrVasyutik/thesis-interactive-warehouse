<script setup lang="ts">
import { useUserStore } from '@/store/userStore';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const profileFields = computed(() => [
  { labelKey: 'profile.fullName', value: userStore.fullName },
  { labelKey: 'profile.position', value: userStore.position },
  { labelKey: 'profile.department', value: userStore.department },
  { labelKey: 'profile.email', value: userStore.email },
  { labelKey: 'profile.phone', value: userStore.phone },
]);

function goToWarehouse() {
  router.push({ name: 'warehouse' });
};
</script>

<template>
  <div>
    <h1>{{ $t('profile.title') }}</h1>
    <q-avatar size="120px" class="q-mb-md" :icon="!userStore.avatarUrl ? 'person' : undefined">
      <img v-if="userStore.avatarUrl" :src="userStore.avatarUrl" alt="Аватар" />
    </q-avatar>
    <q-list style="max-width: 350px" class="text-left q-mb-md">
      <q-item v-for="field in profileFields" :key="field.labelKey">
        <q-item-section class="text-weight-bold">{{ $t(field.labelKey) }}: </q-item-section>
        <q-item-section>{{field.value}}</q-item-section>
      </q-item>
    </q-list>
    <q-btn
      color="primary"
      :label="$t('common.goToWarehouse')"
      @click="goToWarehouse"
    />

  </div>
</template>
