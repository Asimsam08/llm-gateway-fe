"use client";

import React, { useState, useRef, useEffect } from "react";
import { SendIcon, SpinnerIcon, SparklesIcon } from "@/components/icons";

interface ChatInputProps {
  onSend: (message: string) => void;
  isGenerating: boolean;
  initialValue?: string;
}

export function ChatInput({ onSend, isGenerating, initialValue = "" }: ChatInputProps) {
  const [input, setInput] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initialValue if changed from prompt starter
  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialValue]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGenerating) return;

    onSend(input.trim());
    setInput("");
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

  const characterCount = input.length;
  // Estimated token count: approx 4 chars per token
  const estimatedTokens = Math.ceil(characterCount / 4);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:px-6 shrink-0">
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800/90 focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-150 p-2 sm:p-2.5"
      >
        {/* Top Control Bar inside Input */}
        <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] text-zinc-500 border-b border-zinc-800/40">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <SparklesIcon size={12} className="text-indigo-400" />
            <span className="font-medium">Model: Auto Gateway Router</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            {characterCount > 0 && (
              <span>
                ~{estimatedTokens} tokens ({characterCount} chars)
              </span>
            )}
            <span className="hidden sm:inline text-zinc-600">
              Shift + Enter for newline
            </span>
          </div>
        </div>

        {/* Textarea & Send Button */}
        <div className="flex items-end gap-2 pt-1.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder={
              isGenerating
                ? "LLM Gateway is formulating response..."
                : "Ask anything, manage tokens, or test model fallbacks..."
            }
            className="flex-1 max-h-44 bg-transparent resize-none text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none px-2 py-1 leading-relaxed disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-150 shrink-0 cursor-pointer ${
              input.trim() && !isGenerating
                ? "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md shadow-indigo-600/30 active:scale-95"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
            }`}
            title="Send prompt (Enter)"
          >
            {isGenerating ? (
              <SpinnerIcon size={16} />
            ) : (
              <SendIcon size={16} />
            )}
          </button>
        </div>
      </form>

      {/* Security & Disclaimer Footer */}
      <p className="text-[10px] text-zinc-500 text-center mt-2 font-mono">
        LLM Gateway Core • Verified upstream provider cluster • Check mission-critical outputs
      </p>
    </div>
  );
}

