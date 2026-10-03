"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePdfChat } from "@/context/PdfChatContext";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useNavigation } from "@/context/NavigationContext";
import { PdfQuery } from "@/types/pdfChat";
import { PdfUploadDropzone } from "./PdfUploadDropzone";
import { PdfDocumentCard, PdfProcessingPanel } from "./PdfDocumentCard";
import { PdfQueryItem } from "./PdfQueryItem";
import {
  FileTextIcon,
  SparklesIcon,
  SendIcon,
  SpinnerIcon,
  BotIcon,
  MenuIcon,
  PlusIcon,
  TrashIcon,
  MessageSquareIcon,
} from "@/components/icons";

interface PdfChatInterfaceProps {
  initialPrompt?: string;
  onClearPrompt?: () => void;
}

export function PdfChatInterface({
  initialPrompt = "",
  onClearPrompt,
}: PdfChatInterfaceProps) {
  const {
    activeDocument,
    queries,
    isQuerying,
    isUploading,
    isLoadingQueries,
    askQuestion,
    retryQuery,
    startNewUpload,
    deleteDocument,
  } = usePdfChat();
  const { toggleSidebar } = useChat();
  const { activeMode, setActiveMode } = useNavigation();
  const { user } = useAuth();

  const [questionInput, setQuestionInput] = useState(initialPrompt);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const isBusy =
    isUploading ||
    (!!activeDocument &&
      (activeDocument.status === "uploading" || activeDocument.status === "processing"));

  const canChat = activeDocument?.status === "ready" && !isBusy;

  useEffect(() => {
    if (initialPrompt) {
      setQuestionInput(initialPrompt);
      textareaRef.current?.focus();
      onClearPrompt?.();
    }
  }, [initialPrompt, onClearPrompt]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [queries, isQuerying]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, [questionInput]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!questionInput.trim() || isQuerying || !canChat) return;
    void askQuestion(questionInput.trim());
    setQuestionInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const starterChips = [
    { label: "Max booking advance days", query: "What is the maximum number of days in advance that a patient can book an appointment?" },
    { label: "Summarize document", query: "Summarize this document and its key takeaways." },
    { label: "Key conclusions", query: "What are the primary conclusions and findings?" },
    { label: "Important rules", query: "What are the main rules, constraints, or caveats mentioned?" },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 h-[100dvh] relative overflow-hidden bg-[#090a0f] text-zinc-100 font-sans">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-10 left-10 w-80 h-80 bg-violet-600/10 rounded-full blur-[140px]" />

      {/* 1. Sticky / Fixed Header with Navigation Toggle */}
      <header className="h-14 sm:h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors"
            title="Toggle PDF sidebar"
          >
            <MenuIcon size={18} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-white truncate max-w-xs sm:max-w-sm">
              {activeDocument?.fileName || activeDocument?.name || "Chat with PDF"}
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
              {canChat ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Ready for questions</span>
                </>
              ) : isBusy ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Uploading / Processing PDF</span>
                </>
              ) : (
                <span>Upload a document to begin</span>
              )}
            </p>
          </div>
        </div>

        {/* Center / Right Controls: Mode Toggle & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Navigation Mode Switcher Bar */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveMode("chat")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                activeMode === "chat"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
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
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <FileTextIcon size={13} />
              <span className="hidden sm:inline">PDF Chat</span>
            </button>
          </div>

          <button
            type="button"
            onClick={startNewUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200"
            title="Upload another PDF"
          >
            <PlusIcon size={14} className="text-indigo-400" />
            <span className="hidden sm:inline">New PDF</span>
          </button>
          {activeDocument && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this PDF and its conversation history?")) {
                  void deleteDocument(activeDocument.documentId || activeDocument.id);
                }
              }}
              className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
              title="Delete PDF conversation"
            >
              <TrashIcon size={14} />
            </button>
          )}
        </div>
      </header>

      {/* 2. Middle Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 flex flex-col">
        {!activeDocument ? (
          <div className="flex-1 flex flex-col justify-center items-center py-8">
            <div className="text-center max-w-xl mx-auto px-4 mb-6 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
                <SparklesIcon size={14} />
                <span>PDF Vector RAG Engine</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Chat with your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-indigo-400 to-violet-400">
                  PDF Documents
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Upload your PDF. Once uploaded, ask precise questions and get grounded answers with source citations.
              </p>
            </div>
            <PdfUploadDropzone />
          </div>
        ) : isBusy || activeDocument.status === "failed" ? (
          <PdfProcessingPanel />
        ) : (
          <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:px-6 space-y-4">
            <PdfDocumentCard />

            {isLoadingQueries ? (
              <div className="py-16 flex flex-col items-center gap-2">
                <SpinnerIcon size={22} className="text-indigo-400" />
                <p className="text-xs text-zinc-400">Loading conversation history...</p>
              </div>
            ) : queries.length === 0 ? (
              <div className="py-12 sm:py-16 text-center space-y-5 animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <BotIcon size={28} />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    PDF Ready for Questions
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Ask anything about{" "}
                    <span className="text-zinc-200 font-semibold">{activeDocument.fileName || activeDocument.name}</span>.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
                  {starterChips.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => void askQuestion(chip.query)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-indigo-600/20 border border-zinc-800 hover:border-indigo-500/40 text-xs text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {queries.map((q: PdfQuery) => (
                  <PdfQueryItem
                    key={q.id}
                    query={q}
                    userName={user?.name || "You"}
                    onRetry={q.status !== "pending" ? () => void retryQuery(q.id) : undefined}
                  />
                ))}
                <div ref={endRef} className="h-4" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Fixed Bottom Chat Area (Does not scroll or disappear) */}
      <div className="w-full border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md p-4 sm:px-6 shrink-0 sticky bottom-0 z-30">
        <div className="max-w-4xl mx-auto">
          {!canChat && activeDocument && isBusy && (
            <div className="mb-2 text-center text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
              ⚠️ Uploading / processing PDF. Chat is disabled until file processing is completed.
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className={`relative rounded-2xl bg-zinc-900/90 border border-zinc-800/90 focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-xl shadow-black/40 p-2 sm:p-2.5 transition-opacity ${
              !canChat ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {activeDocument && (
              <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] text-zinc-500 border-b border-zinc-800/40">
                <div className="flex items-center gap-1.5 text-zinc-400 min-w-0">
                  <FileTextIcon size={12} className="text-red-400 shrink-0" />
                  <span className="font-medium truncate">{activeDocument.fileName || activeDocument.name}</span>
                </div>
                <span className="hidden sm:inline text-zinc-600 font-mono text-[10px]">
                  Document ID: {(activeDocument.documentId || activeDocument.id).slice(0, 12)}...
                </span>
              </div>
            )}

            <div className="flex items-end gap-2 pt-1.5">
              <textarea
                ref={textareaRef}
                rows={1}
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!canChat || isQuerying}
                placeholder={
                  !activeDocument
                    ? "Upload a PDF above to start asking questions..."
                    : isBusy
                    ? "Uploading / Processing PDF... Please wait"
                    : isQuerying
                    ? "Searching document vector index..."
                    : `Ask a question about ${activeDocument.fileName || activeDocument.name}...`
                }
                className="flex-1 max-h-40 bg-transparent resize-none text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none px-2 py-1 leading-relaxed disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!canChat || !questionInput.trim() || isQuerying}
                className={`p-2 sm:p-2.5 rounded-xl transition-all duration-150 shrink-0 ${
                  canChat && questionInput.trim() && !isQuerying
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-600/30 active:scale-95 cursor-pointer"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
                }`}
              >
                {isQuerying ? <SpinnerIcon size={16} /> : <SendIcon size={16} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
