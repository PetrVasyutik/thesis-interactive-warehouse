import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore('user', () => {
  const name = ref('');
  const email = ref('');

  function setUser(userName: string, userEmail: string) {
    name.value = userName;
    email.value = userEmail;
  }

  function clearUser() {
    name.value = '';
    email.value = '';
  }

  return {
    name,
    email,
    setUser,
    clearUser,
  };
});
