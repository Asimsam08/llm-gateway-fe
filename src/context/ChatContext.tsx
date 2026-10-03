"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Conversation, Message } from "@/types/chat";
import { chatService } from "@/services/chatService";
import { useAuth } from "@/context/AuthContext";

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isGenerating: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredConversations: Conversation[];
  selectConversation: (conversationId: string | number) => Promise<void>;
  createNewChat: () => Promise<Conversation | null>;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (conversationId: string | number) => Promise<void>;
  renameConversation: (conversationId: string | number, newTitle: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const userId = user?.id || "anonymous";

  // Load conversations list on mount or when user changes
  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      setIsLoadingConversations(false);
      return;
    }

    const loadConversations = async () => {
      setIsLoadingConversations(true);
      try {
        const list = await chatService.getConversations(userId);
        setConversations(list);
        if (list.length > 0 && !activeConversation) {
          // Select most recent conversation
          setActiveConversation(list[0]);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, [isAuthenticated, userId]);

  // Load messages whenever activeConversation changes
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const msgs = await chatService.getMessages(activeConversation.id);
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeConversation?.id]);

  // Select conversation
  const selectConversation = useCallback(
    async (conversationId: string | number) => {
      const target = conversations.find((c) => String(c.id) === String(conversationId));
      if (target) {
        setActiveConversation(target);
        if (window.innerWidth < 768) {
          setIsSidebarOpen(false);
        }
      }
    },
    [conversations]
  );

  // Create new conversation
  const createNewChat = useCallback(async () => {
    try {
      const newConv = await chatService.createConversation("New Chat", userId);
      setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)]);
      setActiveConversation(newConv);
      setMessages([]);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
      return newConv;
    } catch (err) {
      console.error("Failed to create new conversation:", err);
      return null;
    }
  }, [userId]);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isGenerating) return;

      let currentConv = activeConversation;

      // Auto-create conversation if none is active
      if (!currentConv) {
        const derivedTitle = content.trim().slice(0, 30) + (content.length > 30 ? "..." : "");
        currentConv = await chatService.createConversation(derivedTitle, userId);
        setConversations((prev) => [currentConv!, ...prev]);
        setActiveConversation(currentConv);
      }

      // Optimistically append user message to local state
      const tempUserMsg: Message = {
        id: `temp_${Date.now()}`,
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString(),
        conversationId: currentConv.id,
      };

      setMessages((prev) => [...prev, tempUserMsg]);
      setIsGenerating(true);

      try {
        const { userMessage, assistantMessage } = await chatService.sendMessage(
          currentConv.id,
          content,
          userId
        );

        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          userMessage,
          assistantMessage,
        ]);

        // Refresh conversation title if it was "New Chat"
        setConversations((prev) =>
          prev.map((c) => {
            if (String(c.id) === String(currentConv!.id)) {
              return {
                ...c,
                lastMessage: content.trim(),
                title:
                  c.title === "New Chat"
                    ? content.trim().slice(0, 28) + (content.length > 28 ? "..." : "")
                    : c.title,
                updatedAt: new Date().toISOString(),
              };
            }
            return c;
          })
        );
      } catch (err) {
        console.error("Failed to send message:", err);
        // Reload messages to display error card saved in service
        const msgs = await chatService.getMessages(currentConv.id);
        setMessages(msgs);
      } finally {
        setIsGenerating(false);
      }
    },
    [activeConversation, isGenerating, userId]
  );

  // Delete conversation
  const deleteConversation = useCallback(
    async (conversationId: string | number) => {
      await chatService.deleteConversation(conversationId, userId);
      setConversations((prev) => {
        const next = prev.filter((c) => String(c.id) !== String(conversationId));
        if (String(activeConversation?.id) === String(conversationId)) {
          setActiveConversation(next.length > 0 ? next[0] : null);
        }
        return next;
      });
    },
    [activeConversation?.id, userId]
  );

  // Rename conversation
  const renameConversation = useCallback(
    (conversationId: string | number, newTitle: string) => {
      const updated = chatService.renameConversation(conversationId, newTitle, userId);
      setConversations(updated);
      if (String(activeConversation?.id) === String(conversationId)) {
        setActiveConversation((prev) => (prev ? { ...prev, title: newTitle } : null));
      }
    },
    [activeConversation?.id, userId]
  );

  // Keyboard shortcut Ctrl/Cmd + K for New Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        createNewChat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createNewChat]);

  // Search filter
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isLoadingConversations,
        isLoadingMessages,
        isGenerating,
        searchQuery,
        setSearchQuery,
        filteredConversations,
        selectConversation,
        createNewChat,
        sendMessage,
        deleteConversation,
        renameConversation,
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

