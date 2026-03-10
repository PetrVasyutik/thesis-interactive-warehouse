import { defineStore } from "pinia";
import { ref } from "vue";

const USER_STORAGE_KEY = 'user_profile';

interface StoredUser {
  name: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  avatarUrl: string;
}

function loadFromStorage(): Partial<StoredUser> {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as StoredUser;
    }
  } catch {
    // ignore
  }
  return {};
}

function saveToStorage(data: StoredUser) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
}

export const useUserStore = defineStore('user', () => {
  const name = ref('');
  const fullName = ref('');
  const email = ref('');
  const phone = ref('');
  const department = ref('');
  const position = ref('');
  // относительный путь, чтобы корректно работать с base на GitHub Pages
  const avatarUrl = ref('avatar.jpg');

  const saved = loadFromStorage();
  if (saved.name !== undefined) name.value = saved.name;
  if (saved.fullName !== undefined) fullName.value = saved.fullName;
  if (saved.email !== undefined) email.value = saved.email;
  if (saved.phone !== undefined) phone.value = saved.phone;
  if (saved.department !== undefined) department.value = saved.department;
  if (saved.position !== undefined) position.value = saved.position;
  if (saved.avatarUrl !== undefined && saved.avatarUrl !== '') {
    // Нормализуем старое значение '/avatar.jpg' в относительное
    avatarUrl.value = saved.avatarUrl.replace(/^\//, '');
  } else if (saved.name !== undefined) {
    avatarUrl.value = 'avatar.jpg';
  }

  function setUser(
    userName: string,
    userEmail: string,
    userFullName: string,
    userPhone: string,
    userDepartment: string,
    userPosition: string
  ) {
    name.value = userName;
    email.value = userEmail;
    fullName.value = userFullName;
    phone.value = userPhone;
    department.value = userDepartment;
    position.value = userPosition;
    if (!avatarUrl.value) {
      avatarUrl.value = 'avatar.jpg';
    }
    saveToStorage({
      name: name.value,
      fullName: fullName.value,
      email: email.value,
      phone: phone.value,
      department: department.value,
      position: position.value,
      avatarUrl: avatarUrl.value,
    });
  }

  function clearUser() {
    name.value = '';
    fullName.value = '';
    email.value = '';
    phone.value = '';
    department.value = '';
    position.value = '';
    avatarUrl.value = '';
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  return {
    name,
    fullName,
    email,
    phone,
    department,
    position,
    avatarUrl,
    setUser,
    clearUser,
  };
});
