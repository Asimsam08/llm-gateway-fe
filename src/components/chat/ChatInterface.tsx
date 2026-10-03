"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigation } from "@/context/NavigationContext";
import { PdfChatInterface } from "@/components/pdf/PdfChatInterface";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { MessageItem } from "./MessageItem";
import { EmptyChatState } from "./EmptyChatState";
import { ChatInput } from "./ChatInput";
import { BotIcon, SpinnerIcon } from "@/components/icons";

export function ChatInterface() {
  const { activeMode } = useNavigation();
  const {
    messages,
    activeConversation,
    isLoadingMessages,
    isGenerating,
    sendMessage,
  } = useChat();

  const { user } = useAuth();
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages update or during generation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSelectPrompt = (promptText: string) => {
    sendMessage(promptText);
  };

  const handleRetryLastMessage = () => {
    if (messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        sendMessage(lastUserMsg.content);
      }
    }
  };

  return (
    <div className="flex-1 flex h-full w-full bg-[#090a0f] text-zinc-100 overflow-hidden font-sans">
      {/* Side Pane: Conversations List / PDF Documents List */}
      <ChatSidebar />

      {/* Main Area based on Mode */}
      {activeMode === "pdf" ? (
        <PdfChatInterface />
      ) : (
        <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
          {/* Ambient background lighting */}
          <div className="pointer-events-none absolute -top-40 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px]" />
          <div className="pointer-events-none absolute bottom-10 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[140px]" />

          {/* Top Header (Fixed at top) */}
          <ChatHeader />

          {/* Middle: Message Stream or Empty Hero (Scrollable) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-800">
            {isLoadingMessages ? (
              <div className="flex-1 h-full flex flex-col items-center justify-center space-y-3 py-16">
                <SpinnerIcon size={24} className="text-indigo-400" />
                <p className="text-xs text-zinc-400">Loading conversation history...</p>
              </div>
            ) : messages.length === 0 ? (
              <EmptyChatState
                userName={user?.name || "there"}
                onSelectPrompt={handleSelectPrompt}
              />
            ) : (
              <div className="py-4 space-y-2">
                {messages.map((message, idx) => (
                  <MessageItem
                    key={message.id || idx}
                    message={message}
                    userName={user?.name || "User"}
                    onRetry={
                      idx === messages.length - 1 && message.role === "assistant"
                        ? handleRetryLastMessage
                        : undefined
                    }
                  />
                ))}

                {/* Live Thinking / Generating Indicator */}
                {isGenerating && (
                  <div className="flex justify-start py-4 px-4 sm:px-6 bg-zinc-950/40 border-y border-zinc-900/60 animate-fadeIn">
                    <div className="flex items-start gap-3.5 max-w-3xl w-full">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0 mt-0.5 animate-pulse">
                        <BotIcon size={16} />
                      </div>
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">LLM Gateway</span>
                          <span className="text-[10px] text-indigo-400 font-mono">
                            Orchestrating...
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                          <span
                            className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>

          {/* Bottom: Fixed Input Panel */}
          <div className="shrink-0 w-full">
            <ChatInput
              onSend={(content) => sendMessage(content)}
              isGenerating={isGenerating}
              initialValue={selectedPrompt}
            />
          </div>
        </main>
      )}
    </div>
  );
}

