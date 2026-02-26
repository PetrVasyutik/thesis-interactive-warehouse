import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar } from 'quasar';
import './style.css';
import App from './App.vue';
import router from './router';
import 'quasar/dist/quasar.css';
import { setupMockChatServer } from './websocket/mockChatServer';

// Для дипломного демо используем mock WebSocket-сервер чата
setupMockChatServer();

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Quasar, {
  config: {
    dark: false,
  },
});

app.mount('#app');
