export type WebSocketMessage = WarehouseChatMessage;

export interface WarehouseChatMessage {
  type: 'chat_message';
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

