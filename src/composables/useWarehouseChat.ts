import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useUserStore } from '@/store/userStore';
import {
  closeWebSocketConnection,
  createWebSocketConnection,
  sendWebSocketMessage,
  isWebSocketConnected,
} from '@/services/websocketClient';
import type { WarehouseChatMessage } from '@/types/websocket';

const WS_URL = 'ws://localhost:3001/chat';

export function useWarehouseChat() {
  const userStore = useUserStore();

  const messages = ref<WarehouseChatMessage[]>([]);
  const newMessage = ref('');
  const isConnected = ref(false);

  function connect() {
    createWebSocketConnection(WS_URL, {
      onOpen() {
        isConnected.value = true;
      },
      onClose() {
        isConnected.value = false;
      },
      onMessage(data) {
        if (data.type === 'chat_message') {
          messages.value.push(data);
        }
      },
      onError() {
        isConnected.value = isWebSocketConnected();
      },
    });
  }

  function sendMessage() {
    const text = newMessage.value.trim();
    if (!text) {
      return;
    }

    const now = new Date().toISOString();
    const message: WarehouseChatMessage = {
      type: 'chat_message',
      author: userStore.fullName || userStore.name || 'Сотрудник склада',
      role: userStore.position || '',
      text,
      timestamp: now,
    };

    sendWebSocketMessage(message);
    messages.value.push(message);
    newMessage.value = '';
  }

  onMounted(() => {
    connect();
  });

  onBeforeUnmount(() => {
    closeWebSocketConnection();
  });

  return {
    messages,
    newMessage,
    isConnected,
    sendMessage,
  };
}

