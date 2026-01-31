<script setup lang="ts">
import { useUserStore } from '@/store/userStore';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const profileFields = computed(() => [
  { label: 'ФИО', value: userStore.fullName },
  { label: 'Должность', value: userStore.position },
  { label: 'Отдел', value: userStore.department },
  { label: 'Email', value: userStore.email },
  { label: 'Телефон', value: userStore.phone },
]);

function goToWarehouse() {
  router.push({ name: 'warehouse' });
};
</script>

<template>
  <div>
    <h1>Личный кабинет</h1>
    <q-avatar size="120px" class="q-mb-md" :icon="!userStore.avatarUrl ? 'person' : undefined">
      <img v-if="userStore.avatarUrl" :src="userStore.avatarUrl" alt="Аватар" />
    </q-avatar>
    <q-list style="max-width: 350px" class="text-left q-mb-md">
      <q-item v-for="field in profileFields" :key="field.label">
        <q-item-section class="text-weight-bold">{{field.label}}: </q-item-section>
        <q-item-section>{{field.value}}</q-item-section>
      </q-item>
    </q-list>
    <q-btn color="primary" label="Перейти на склад" @click="goToWarehouse"></q-btn>

  </div>
</template>
