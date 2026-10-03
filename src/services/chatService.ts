import { request } from "@/lib/api";
import {
  Conversation,
  Message,
  CreateConversationResponse,
  ChatApiResponse,
} from "@/types/chat";

const CONVERSATIONS_KEY_PREFIX = "llm_gateway_conversations_";
const MESSAGES_KEY_PREFIX = "llm_gateway_messages_";

function getLocalConversations(userId: string | number): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${CONVERSATIONS_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalConversations(userId: string | number, convs: Conversation[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`${CONVERSATIONS_KEY_PREFIX}${userId}`, JSON.stringify(convs));
  }
}

function getLocalMessages(conversationId: string | number): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${MESSAGES_KEY_PREFIX}${conversationId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMessages(conversationId: string | number, msgs: Message[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`${MESSAGES_KEY_PREFIX}${conversationId}`, JSON.stringify(msgs));
  }
}

export const chatService = {
  /**
   * Fetch all conversations for the user.
   * Tries backend GET /api/conversations, falls back to persistent local cache.
   */
  async getConversations(userId: string | number): Promise<Conversation[]> {
    try {
      const response = await request<Conversation[] | { conversations: Conversation[] }>(
        "/api/conversations",
        { method: "GET" }
      );
      const list = Array.isArray(response)
        ? response
        : response?.conversations || [];

      if (list.length > 0) {
        saveLocalConversations(userId, list);
        return list;
      }
    } catch {
      // Backend GET endpoint not available or returned 404; use local fallback
    }

    return getLocalConversations(userId);
  },

  /**
   * Create a new conversation via POST /api/conversations
   */
  async createConversation(
    title: string,
    userId: string | number
  ): Promise<Conversation> {
    try {
      const response = await request<CreateConversationResponse>("/api/conversations", {
        method: "POST",
        data: { title: title || "New Chat" },
      });

      const newConv: Conversation = {
        id: response.conversation.id,
        title: response.conversation.title || title || "New Chat",
        createdAt: response.conversation.createdAt || new Date().toISOString(),
        updatedAt: response.conversation.updatedAt || new Date().toISOString(),
        userId,
      };

      const existing = getLocalConversations(userId);
      const updated = [newConv, ...existing.filter((c) => c.id !== newConv.id)];
      saveLocalConversations(userId, updated);

      return newConv;
    } catch {
      // Fallback local conversation creation if offline
      const localId = `local_${Date.now()}`;
      const newConv: Conversation = {
        id: localId,
        title: title || "New Chat",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId,
      };

      const existing = getLocalConversations(userId);
      saveLocalConversations(userId, [newConv, ...existing]);
      return newConv;
    }
  },

  /**
   * Get all messages for a specific conversation.
   * Tries backend GET /api/conversations/:id/messages, falls back to local cache.
   */
  async getMessages(conversationId: string | number): Promise<Message[]> {
    try {
      const response = await request<Message[] | { messages: Message[] }>(
        `/api/conversations/${conversationId}/messages`,
        { method: "GET" }
      );
      const list = Array.isArray(response)
        ? response
        : response?.messages || [];

      if (list.length > 0) {
        saveLocalMessages(conversationId, list);
        return list;
      }
    } catch {
      // Fallback to locally stored messages
    }

    return getLocalMessages(conversationId);
  },

  /**
   * Send a chat message via POST /api/chat and receive AI reply
   */
  async sendMessage(
    conversationId: string | number,
    messageContent: string,
    userId?: string | number
  ): Promise<{ userMessage: Message; assistantMessage: Message }> {
    const trimmed = messageContent.trim();
    const tempUserId = `user_${Date.now()}`;

    const userMessage: Message = {
      id: tempUserId,
      role: "user",
      content: trimmed,
      status: "COMPLETED",
      createdAt: new Date().toISOString(),
      conversationId,
    };

    // Save user message immediately
    const currentMessages = getLocalMessages(conversationId);
    saveLocalMessages(conversationId, [...currentMessages, userMessage]);

    // Update lastMessage on conversation
    if (userId) {
      const convs = getLocalConversations(userId);
      const idx = convs.findIndex((c) => String(c.id) === String(conversationId));
      if (idx !== -1) {
        convs[idx].lastMessage = trimmed;
        convs[idx].updatedAt = new Date().toISOString();
        // If it still has default title, set title from first message
        if (convs[idx].title === "New Chat" || !convs[idx].title) {
          convs[idx].title = trimmed.slice(0, 32) + (trimmed.length > 32 ? "..." : "");
        }
        saveLocalConversations(userId, [...convs]);
      }
    }

    try {
      const response = await request<ChatApiResponse>("/api/chat", {
        method: "POST",
        data: {
          conversationId: Number(conversationId) || conversationId,
          message: trimmed,
        },
      });

      const assistantMessage: Message = {
        id: response.assistantMessageId || `ast_${Date.now()}`,
        role: "assistant",
        content: response.reply,
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
        conversationId,
      };

      // If userMessage ID came from backend
      if (response.messageId) {
        userMessage.id = response.messageId;
      }

      saveLocalMessages(conversationId, [...currentMessages, userMessage, assistantMessage]);

      return { userMessage, assistantMessage };
    } catch (error) {
      // Mark user message as failed or provide error bubble
      const failedAssistantMessage: Message = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content:
          error instanceof Error
            ? `⚠️ Request failed: ${error.message}. Please verify the backend and try again.`
            : "⚠️ Unable to reach LLM Gateway backend service. Please check your connection.",
        status: "FAILED",
        createdAt: new Date().toISOString(),
        conversationId,
      };

      saveLocalMessages(conversationId, [
        ...currentMessages,
        userMessage,
        failedAssistantMessage,
      ]);

      throw error;
    }
  },

  /**
   * Delete conversation locally and attempt backend delete
   */
  async deleteConversation(
    conversationId: string | number,
    userId: string | number
  ): Promise<void> {
    try {
      await request(`/api/conversations/${conversationId}`, { method: "DELETE" });
    } catch {
      // Ignore if endpoint not yet implemented
    }

    const convs = getLocalConversations(userId).filter(
      (c) => String(c.id) !== String(conversationId)
    );
    saveLocalConversations(userId, convs);

    if (typeof window !== "undefined") {
      localStorage.removeItem(`${MESSAGES_KEY_PREFIX}${conversationId}`);
    }
  },

  /**
   * Rename a conversation locally and in state
   */
  renameConversation(
    conversationId: string | number,
    newTitle: string,
    userId: string | number
  ): Conversation[] {
    const convs = getLocalConversations(userId);
    const updated = convs.map((c) =>
      String(c.id) === String(conversationId)
        ? { ...c, title: newTitle.trim() || "Untitled Chat", updatedAt: new Date().toISOString() }
        : c
    );
    saveLocalConversations(userId, updated);
    return updated;
  },
};

