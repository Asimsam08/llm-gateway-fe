"use client";

import React, { useState, useRef, useEffect } from "react";
import { SendIcon, SpinnerIcon } from "@/components/icons";

interface ChatInputProps {
  onSend: (message: string) => void;
  isGenerating: boolean;
  initialValue?: string;
}

export function ChatInput({ onSend, isGenerating, initialValue = "" }: ChatInputProps) {
  const [input, setInput] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      textareaRef.current?.focus();
    }
  }, [initialValue]);

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

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:px-6 shrink-0">
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800/90 focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-150 p-2 sm:p-2.5"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder={isGenerating ? "Thinking..." : "Ask anything..."}
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
            title="Send (Enter)"
          >
            {isGenerating ? <SpinnerIcon size={16} /> : <SendIcon size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}
