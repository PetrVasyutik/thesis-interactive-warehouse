import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { WarehouseChatMessage } from '@/types/websocket';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<WarehouseChatMessage[]>([]);

  function addMessage(message: WarehouseChatMessage) {
    messages.value.push(message);
  }

  function clear() {
    messages.value = [];
  }

  return {
    messages,
    addMessage,
    clear,
  };
});

