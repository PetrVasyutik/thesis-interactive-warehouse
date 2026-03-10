import { defineStore } from 'pinia';
import { ref } from 'vue';

const TOKEN_KEY = 'auth_token';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const token = ref<string | null>(null);

  const savedToken = localStorage.getItem(TOKEN_KEY);
  if (savedToken) {
    token.value = savedToken;
    isAuthenticated.value = true;
  }

  function login(newToken: string) {
    token.value = newToken;
    isAuthenticated.value = true;
    localStorage.setItem(TOKEN_KEY, newToken);
  }

  function logout() {
    token.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem(TOKEN_KEY);
  }

  return {
    isAuthenticated,
    token,
    login,
    logout,
  };
});

