import type { WebSocketMessage } from '@/types/websocket';

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

export interface WebSocketCallbacks {
  onOpen?: (event: Event) => void;
  onMessage?: (data: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
}

/**
 * Создаёт WebSocket‑соединение с авто‑переподключением.
 */
export function createWebSocketConnection(
  url: string,
  callbacks: WebSocketCallbacks = {},
): WebSocket {
  const {
    onOpen = () => {},
    onMessage = () => {},
    onError = () => {},
    onClose = () => {},
  } = callbacks;

  try {
    ws = new WebSocket(url);

    ws.onopen = (event: Event) => {
      reconnectAttempts = 0;
      onOpen(event);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as WebSocketMessage;
        onMessage(data);
      } catch (error) {
        // На всякий случай отдаём «сырые» данные
        // eslint-disable-next-line no-console
        console.error('Ошибка парсинга WebSocket сообщения:', error);
      }
    };

    ws.onerror = (error: Event) => {
      onError(error);
    };

    ws.onclose = (event: CloseEvent) => {
      onClose(event);

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts += 1;
        setTimeout(() => {
          createWebSocketConnection(url, callbacks);
        }, RECONNECT_DELAY);
      }
    };

    return ws;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Ошибка создания WebSocket соединения:', error);
    throw error;
  }
}

export function sendWebSocketMessage(data: WebSocketMessage): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    // eslint-disable-next-line no-console
    console.warn('WebSocket не подключен');
  }
}

export function closeWebSocketConnection(): void {
  if (ws) {
    ws.close();
    ws = null;
  }
}

export function isWebSocketConnected(): boolean {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}

