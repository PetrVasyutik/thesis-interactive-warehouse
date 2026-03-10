<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { useWarehouseChat } from '@/composables/useWarehouseChat';
import { loadPersistedState } from '@/controllers/WarehouseController';

const userStore = useUserStore();
const router = useRouter();

const { messages, newMessage, isConnected, sendMessage } = useWarehouseChat();

const profileFields = computed(() => [
  { labelKey: 'profile.fullName', value: userStore.fullName },
  { labelKey: 'profile.position', value: userStore.position },
  { labelKey: 'profile.department', value: userStore.department },
  { labelKey: 'profile.email', value: userStore.email },
  { labelKey: 'profile.phone', value: userStore.phone },
]);

const initials = computed(() => {
  const name = userStore.fullName || '';
  if (!name) return 'ИИ';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts[1]?.[0] ?? '';
  return (first + second || first || 'ИИ').toUpperCase();
});

// Константа максимальной вместимости склада:
// 3 блока * 5 зон * 5 стеллажей * 10 паллет
const MAX_CAPACITY = 3 * 5 * 5 * 10;

const warehouseSummary = computed(() => {
  const saved = loadPersistedState();
  if (!saved) {
    return {
      totalCapacity: MAX_CAPACITY,
      onShelves: 0,
      unassigned: 0,
      totalPallets: 0,
      fillPercent: 0,
    };
  }

  const onShelves = (Object.values(saved.shelves) as number[]).reduce(
    (sum, v) => sum + v,
    0,
  );
  const unassigned = saved.unassignedPallets;
  const totalPallets = onShelves + unassigned;
  const fillPercent =
    MAX_CAPACITY > 0 ? Math.round((onShelves / MAX_CAPACITY) * 100) : 0;

  return {
    totalCapacity: MAX_CAPACITY,
    onShelves,
    unassigned,
    totalPallets,
    fillPercent,
  };
});

function goToWarehouse() {
  router.push({ name: 'warehouse' });
}
</script>

<template>
  <div class="profile">
    <h1>{{ $t('profile.title') }}</h1>
    <div class="profile__container">
      <q-avatar size="120px" class="q-mb-md profile__avatar">
        <img v-if="userStore.avatarUrl" :src="userStore.avatarUrl" alt="Аватар" />
        <span v-else class="profile__avatar-initials">
          {{ initials }}
        </span>
      </q-avatar>
    <q-list style="max-width: 350px" class="text-left q-mb-md">
      <q-item v-for="field in profileFields" :key="field.labelKey">
        <q-item-section class="text-weight-bold">{{ $t(field.labelKey) }}: </q-item-section>
        <q-item-section>{{ field.value }}</q-item-section>
      </q-item>
    </q-list>

    <div class="profile__dashboard">
      <h2 class="profile__dashboard-title">{{ $t('profile.dashboardTitle') }}</h2>
      <div class="profile__dashboard-grid">
        <div class="profile__dashboard-card">
          <div class="profile__dashboard-label">{{ $t('profile.dashboardTotalCapacity') }}</div>
          <div class="profile__dashboard-value">
            {{ warehouseSummary.totalCapacity }}
          </div>
        </div>
        <div class="profile__dashboard-card">
          <div class="profile__dashboard-label">{{ $t('profile.dashboardOnShelves') }}</div>
          <div class="profile__dashboard-value">
            {{ warehouseSummary.onShelves }}
          </div>
        </div>
        <div class="profile__dashboard-card">
          <div class="profile__dashboard-label">{{ $t('profile.dashboardUnassigned') }}</div>
          <div class="profile__dashboard-value">
            {{ warehouseSummary.unassigned }}
          </div>
        </div>
        <div class="profile__dashboard-card">
          <div class="profile__dashboard-label">{{ $t('profile.dashboardFillPercent') }}</div>
          <div class="profile__dashboard-value">
            {{ warehouseSummary.fillPercent }}%
          </div>
        </div>
      </div>
      <div class="profile__dashboard-btn">
        <q-btn
      color="primary"
      :label="$t('common.goToWarehouse')"
      class="q-mt-md q-mb-lg"
      @click="goToWarehouse"
    />
      </div>

    </div>
  </div>


    <div class="profile__chat">
      <div class="profile__chat-header">
        <h2 class="profile__chat-title">{{ $t('warehouse.chatTitle') }}</h2>
        <span
          class="profile__chat-status"
          :class="{ 'profile__chat-status--online': isConnected }"
        >
          {{ isConnected ? 'online' : 'offline' }}
        </span>
      </div>

      <div class="profile__chat-messages">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="profile__chat-message"
        >
          <div class="profile__chat-message-header">
            <span class="profile__chat-author">{{ msg.author }}</span>
            <span v-if="msg.role" class="profile__chat-role"> — {{ msg.role }}</span>
          </div>
          <div class="profile__chat-text">
            {{ msg.text }}
          </div>
        </div>
        <div v-if="messages.length === 0" class="profile__chat-empty">
          {{ $t('warehouse.chatEmpty') }}
        </div>
      </div>

      <div class="profile__chat-input">
        <q-input
          v-model="newMessage"
          dense
          standout
          class="profile__chat-field"
          :placeholder="$t('warehouse.chatPlaceholder')"
          @keyup.enter="sendMessage"
        />
        <q-btn
          color="primary"
          :label="$t('warehouse.chatSend')"
          :disable="!newMessage.trim()"
          class="profile__chat-send"
          @click="sendMessage"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  &__container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 50px;
  }

  &__dashboard-btn {
    width: 100%;
    text-align: center;
    margin-top: 20px;
  }
}

.profile__avatar {
  background-color: #1976d2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 600;
}

.profile__avatar-initials {
  display: inline-block;
}

.profile__dashboard {
  width: 100%;
  max-width: 600px;
  text-align: left;
  padding: 10px;
  margin-left: 200px;
  border: 2px solid rgb(138, 138, 189);
  border-radius: 5px;
}

.profile__dashboard-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
}

.profile__dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.profile__dashboard-card {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background-color: #fafafa;
  text-align: center;
}

.profile__dashboard-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.profile__dashboard-value {
  font-size: 18px;
  font-weight: 600;
}

.profile__chat {
  margin-top: 40px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile__chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile__chat-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.profile__chat-status {
  font-size: 12px;
  color: #999;
}

.profile__chat-status--online {
  color: #2e7d32;
}

.profile__chat-messages {
  max-height: 160px;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile__chat-message {
  font-size: 13px;
  line-height: 1.3;
  padding: 4px 6px;
  border-radius: 4px;
  background-color: #fafafa;
}

.profile__chat-message-header {
  font-weight: 600;
  margin-bottom: 2px;
}

.profile__chat-role {
  font-weight: 400;
  color: #666;
}

.profile__chat-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.profile__chat-empty {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

.profile__chat-input {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.profile__chat-field {
  flex: 1;
}

.profile__chat-send {
  white-space: nowrap;
}
</style>
