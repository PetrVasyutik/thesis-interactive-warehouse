<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { useWarehouseChat } from '@/composables/useWarehouseChat';

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

function goToWarehouse() {
  router.push({ name: 'warehouse' });
}
</script>

<template>
  <div class="profile">
    <h1>{{ $t('profile.title') }}</h1>
    <q-avatar size="120px" class="q-mb-md" :icon="!userStore.avatarUrl ? 'person' : undefined">
      <img v-if="userStore.avatarUrl" :src="userStore.avatarUrl" alt="Аватар" />
    </q-avatar>
    <q-list style="max-width: 350px" class="text-left q-mb-md">
      <q-item v-for="field in profileFields" :key="field.labelKey">
        <q-item-section class="text-weight-bold">{{ $t(field.labelKey) }}: </q-item-section>
        <q-item-section>{{ field.value }}</q-item-section>
      </q-item>
    </q-list>
    <q-btn
      color="primary"
      :label="$t('common.goToWarehouse')"
      class="q-mb-lg"
      @click="goToWarehouse"
    />

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
}

.profile__chat {
  margin-top: 24px;
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
