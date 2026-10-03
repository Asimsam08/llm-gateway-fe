export interface Message {
  id: string | number;
  role: "user" | "assistant" | "system";
  content: string;
  status?: "PENDING" | "COMPLETED" | "FAILED";
  createdAt?: string;
  conversationId?: number | string;
}

export interface Conversation {
  id: number | string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId?: number | string;
  lastMessage?: string;
}

export interface CreateConversationResponse {
  message: string;
  conversation: Conversation;
}

export interface ChatApiResponse {
  message: string;
  reply: string;
  messageId: number;
  assistantMessageId: number;
}

export interface RetryMessageApiResponse {
  message?: string;
  reply?: string;
  assistantMessageId?: number;
}

