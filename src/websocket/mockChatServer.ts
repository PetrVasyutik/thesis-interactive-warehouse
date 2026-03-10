// @ts-nocheck
/**
 * Mock WebSocket «сервер» для чата склада.
 * Работает только в браузере: перехватывает window.WebSocket и
 * имитирует подключение + рассылку сообщений.
 */

const WS_CONNECTING = 0;
const WS_OPEN = 1;
const WS_CLOSING = 2;
const WS_CLOSED = 3;

interface MockConnection {
  url: string;
  readyState: number;
  protocol: string;
  onopen: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
}

const mockConnections: MockConnection[] = [];
let hasSentWelcome = false;

export function setupMockChatServer(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const OriginalWebSocket = window.WebSocket;

  // Если уже перехватили — повторно не делаем
  if ((window as any)._warehouseMockChatInstalled) {
    return;
  }
  (window as any)._warehouseMockChatInstalled = true;

  window.WebSocket = class MockWebSocket {
    url: string;

    readyState: number;

    protocol: string;

    onopen: ((event: Event) => void) | null;

    onmessage: ((event: MessageEvent) => void) | null;

    onerror: ((event: Event) => void) | null;

    onclose: ((event: CloseEvent) => void) | null;

    constructor(url: string, protocols?: string | string[]) {
      // Наш mock работает для ws://localhost:3001 и ws://mock
      if (url.includes('ws://localhost:3001') || url.includes('ws://mock')) {
        this.url = url;
        this.readyState = WS_CONNECTING;
        this.protocol = (protocols as string) || '';
        this.onopen = null;
        this.onmessage = null;
        this.onerror = null;
        this.onclose = null;

        mockConnections.push(this);

        // Имитируем асинхронное подключение
        setTimeout(() => {
          this.readyState = WS_OPEN;
          if (this.onopen) {
            this.onopen(new Event('open'));
          }
          // Приветственное сообщение отправляем только один раз за сессию,
          // чтобы оно не дублировалось при нескольких подключениях/переподключениях.
          if (!hasSentWelcome) {
            hasSentWelcome = true;
            this.pushSystemMessage(
              'Система',
              'Добро пожаловать в чат смены склада (demo, mock-сервер).',
            );
          }
        }, 100);
      } else {
        // Для других URL — оригинальный WebSocket
        // eslint-disable-next-line no-constructor-return
        return new OriginalWebSocket(url, protocols as any);
      }
    }

    send(data: string): void {
      // В демо-режиме просто рассылаем это сообщение всем mock-подключениям
      try {
        const parsed = JSON.parse(data);
        this.broadcast(parsed);
      } catch {
        this.broadcast({ type: 'chat_message', author: 'Неизвестно', role: '', text: data });
      }
    }

    close(): void {
      this.readyState = WS_CLOSING;
      setTimeout(() => {
        this.readyState = WS_CLOSED;
        const idx = mockConnections.indexOf(this);
        if (idx >= 0) {
          mockConnections.splice(idx, 1);
        }
        if (this.onclose) {
          this.onclose(new CloseEvent('close'));
        }
      }, 100);
    }

    private broadcast(payload: unknown): void {
      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify(payload),
      });
      mockConnections.forEach((conn) => {
        if (conn.readyState === WS_OPEN && conn.onmessage) {
          conn.onmessage(messageEvent);
        }
      });
    }

    private pushSystemMessage(author: string, text: string): void {
      const payload = {
        type: 'chat_message',
        author,
        role: 'система',
        text,
        timestamp: new Date().toISOString(),
      };
      this.broadcast(payload);
    }
  } as any;
}

