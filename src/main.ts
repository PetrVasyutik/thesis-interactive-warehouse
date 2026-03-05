import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar } from 'quasar';
import './style.css';
import App from './App.vue';
import router from './router';
import 'quasar/dist/quasar.css';
import { setupMockChatServer } from './websocket/mockChatServer';
import { i18n } from './i18n';

// Для дипломного демо используем mock WebSocket-сервер чата
setupMockChatServer();

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(Quasar, {
  config: {
    dark: false,
  },
});

app.mount('#app');
