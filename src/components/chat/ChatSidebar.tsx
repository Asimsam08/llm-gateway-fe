"use client";

import React, { useState, useMemo } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import {
  BotIcon,
  PlusIcon,
  SearchIcon,
  MessageSquareIcon,
  TrashIcon,
  EditIcon,
  CloseIcon,
  LogOutIcon,
  CheckIcon,
  SparklesIcon,
} from "@/components/icons";

interface DateGroupedConversations {
  label: string;
  items: Array<any>;
}

export function ChatSidebar() {
  const {
    activeConversation,
    filteredConversations,
    isLoadingConversations,
    searchQuery,
    setSearchQuery,
    selectConversation,
    createNewChat,
    deleteConversation,
    renameConversation,
    isSidebarOpen,
    closeSidebar,
  } = useChat();

  const { user, logout } = useAuth();

  // State for inline editing of titles
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - 7 * 86400000;

    const groups: { [key: string]: typeof filteredConversations } = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    filteredConversations.forEach((conv) => {
      const convTime = new Date(conv.updatedAt || conv.createdAt).getTime();
      if (convTime >= today) {
        groups["Today"].push(conv);
      } else if (convTime >= yesterday) {
        groups["Yesterday"].push(conv);
      } else if (convTime >= sevenDaysAgo) {
        groups["Previous 7 Days"].push(conv);
      } else {
        groups["Older"].push(conv);
      }
    });

    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([label, items]) => ({ label, items }));
  }, [filteredConversations]);

  const handleStartRename = (e: React.MouseEvent, id: string | number, currentTitle: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = (e: React.MouseEvent | React.FormEvent, id: string | number) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      renameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (confirm("Delete this conversation?")) {
      deleteConversation(id);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 sm:w-80 bg-zinc-950 border-r border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
              <BotIcon size={18} />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight">
                LLM Gateway
              </span>
              <span className="block text-[10px] text-zinc-500 font-mono">
                Conversational AI
              </span>
            </div>
          </div>

          <button
            onClick={closeSidebar}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* New Chat Button & Search Filter */}
        <div className="p-3.5 space-y-2.5 border-b border-zinc-800/40">
          <button
            onClick={() => createNewChat()}
            className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-[0.99] cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <PlusIcon size={16} className="transition-transform group-hover:rotate-90" />
              <span>New Conversation</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-black/25 text-indigo-100 rounded border border-white/10">
              Ctrl K
            </kbd>
          </button>

          {/* Search Filter */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <SearchIcon size={14} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full rounded-xl bg-zinc-900/90 pl-8 pr-7 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 border border-zinc-800/80 focus:border-indigo-500/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-500 hover:text-zinc-300"
              >
                <CloseIcon size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Conversations Scroll Area */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 select-none scrollbar-thin scrollbar-thumb-zinc-800">
          {isLoadingConversations ? (
            <div className="space-y-2 px-2 py-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-zinc-900/60 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 px-4 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800/80 text-zinc-500 mx-auto flex items-center justify-center">
                <MessageSquareIcon size={18} />
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                {searchQuery ? "No matching chats" : "No conversations yet"}
              </p>
              <p className="text-[11px] text-zinc-600">
                {searchQuery
                  ? "Try searching for a different keyword"
                  : "Click '+ New Conversation' above to start"}
              </p>
            </div>
          ) : (
            groupedConversations.map(({ label, items }) => (
              <div key={label} className="space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase font-mono">
                  {label}
                </div>
                <div className="space-y-0.5">
                  {items.map((conv) => {
                    const isActive = String(activeConversation?.id) === String(conv.id);
                    const isEditing = editingId === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => !isEditing && selectConversation(conv.id)}
                        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                          isActive
                            ? "bg-zinc-900 text-white font-medium shadow-sm border border-zinc-800"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                        }`}
                      >
                        {isEditing ? (
                          <form
                            onSubmit={(e) => handleSaveRename(e, conv.id)}
                            className="flex-1 flex items-center gap-1.5"
                          >
                            <input
                              type="text"
                              autoFocus
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onBlur={(e) => handleSaveRename(e, conv.id)}
                              className="flex-1 bg-zinc-950 text-white text-xs px-2 py-1 rounded border border-indigo-500 focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                            >
                              <CheckIcon size={14} />
                            </button>
                          </form>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <MessageSquareIcon
                                size={14}
                                className={`shrink-0 ${
                                  isActive ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"
                                }`}
                              />
                              <div className="truncate">
                                <span className="block truncate leading-snug">
                                  {conv.title || "Untitled Chat"}
                                </span>
                                {conv.lastMessage && (
                                  <span className="block truncate text-[10px] text-zinc-600 group-hover:text-zinc-500">
                                    {conv.lastMessage}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons (visible on hover or when active) */}
                            <div
                              className={`flex items-center gap-1 shrink-0 ${
                                isActive
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100"
                              } transition-opacity`}
                            >
                              <button
                                type="button"
                                onClick={(e) => handleStartRename(e, conv.id, conv.title)}
                                className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                                title="Rename"
                              >
                                <EditIcon size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDelete(e, conv.id)}
                                className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                                title="Delete"
                              >
                                <TrashIcon size={12} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer User Panel */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-zinc-200 truncate leading-none">
                  {user?.name || "Anonymous User"}
                </p>
                <p className="text-[10px] text-zinc-500 truncate leading-none mt-1">
                  {user?.email || "Connected via JWT"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOutIcon size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

