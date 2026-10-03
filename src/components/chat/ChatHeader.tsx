"use client";

import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";
import { useNavigation } from "@/context/NavigationContext";
import {
  MenuIcon,
  PlusIcon,
  BotIcon,
  SparklesIcon,
  CheckIcon,
  EditIcon,
  TrashIcon,
  MessageSquareIcon,
  FileTextIcon,
} from "@/components/icons";

export function ChatHeader() {
  const {
    activeConversation,
    createNewChat,
    toggleSidebar,
    renameConversation,
    deleteConversation,
    messages,
  } = useChat();

  const { activeMode, setActiveMode } = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const handleStartRename = () => {
    if (activeConversation) {
      setTitleInput(activeConversation.title);
      setIsEditing(true);
    }
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeConversation && titleInput.trim()) {
      renameConversation(activeConversation.id, titleInput.trim());
    }
    setIsEditing(false);
  };

  return (
    <header className="h-14 sm:h-16 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md px-4 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors"
          title="Toggle Sidebar"
        >
          <MenuIcon size={18} />
        </button>

        {/* Conversation Title / Edit */}
        {activeConversation ? (
          isEditing ? (
            <form onSubmit={handleSaveRename} className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={() => setIsEditing(false)}
                className="text-sm font-semibold bg-zinc-900 text-white px-2.5 py-1 rounded-lg border border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="p-1 text-emerald-400 hover:text-emerald-300"
              >
                <CheckIcon size={16} />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 min-w-0 group">
              <h2 className="text-sm sm:text-base font-semibold text-white truncate max-w-xs sm:max-w-md">
                {activeConversation.title || "New Conversation"}
              </h2>
              <button
                onClick={handleStartRename}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-zinc-200 transition-opacity"
                title="Rename Conversation"
              >
                <EditIcon size={13} />
              </button>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-semibold text-white">
              New Chat
            </span>
          </div>
        )}
      </div>

      {/* Center/Right Controls: Mode Switcher & Quick Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Mode Switcher Pill Bar */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveMode("chat")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              activeMode === "chat"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <MessageSquareIcon size={13} />
            <span className="hidden sm:inline">AI Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("pdf")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              activeMode === "pdf"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileTextIcon size={13} />
            <span className="hidden sm:inline">PDF Chat</span>
          </button>
        </div>

        {/* Quick New Chat Button */}
        <button
          onClick={() => createNewChat()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          title="Start New Conversation"
        >
          <PlusIcon size={14} className="text-indigo-400" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {activeConversation && messages.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Delete this conversation?")) {
                deleteConversation(activeConversation.id);
              }
            }}
            className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
            title="Delete Conversation"
          >
            <TrashIcon size={14} />
          </button>
        )}
      </div>
    </header>
  );
}
