"use client";

import React from "react";
import {
  BotIcon,
  SparklesIcon,
  CpuIcon,
  ZapIcon,
  LayersIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@/components/icons";

interface PromptStarter {
  title: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
  category: string;
}

interface EmptyChatStateProps {
  onSelectPrompt: (promptText: string) => void;
  userName?: string;
}

export function EmptyChatState({ onSelectPrompt, userName = "there" }: EmptyChatStateProps) {
  const starters: PromptStarter[] = [
    {
      title: "Optimize Token Budget",
      category: "Budget Engine",
      description: "Learn how dynamic token budget pruning reduces API costs.",
      prompt: "How does the LLM Gateway implement dynamic token budget pruning to minimize latency and API costs?",
      icon: <CpuIcon size={18} className="text-indigo-400" />,
    },
    {
      title: "Zero-Drop Retries",
      category: "Resilience",
      description: "Understand automated exponential backoff failovers.",
      prompt: "Explain how zero-drop retry loops work with exponential backoff when upstream LLM providers rate limit.",
      icon: <ZapIcon size={18} className="text-violet-400" />,
    },
    {
      title: "Context Window Optimization",
      category: "Context Engine",
      description: "Manage stateful conversation histories efficiently.",
      prompt: "What are the best strategies for managing sliding context windows in stateful AI conversation threads?",
      icon: <LayersIcon size={18} className="text-emerald-400" />,
    },
    {
      title: "Enterprise Multi-Model Routing",
      category: "Architecture",
      description: "Compare OpenAI vs Gemini routing patterns.",
      prompt: "Show an enterprise architecture comparing latency, token consumption, and routing patterns for OpenAI and Gemini.",
      icon: <ShieldCheckIcon size={18} className="text-amber-400" />,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 max-w-4xl mx-auto w-full text-center select-none animate-fadeIn">
      {/* Hero Badge & Title */}
      <div className="space-y-4 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <SparklesIcon size={14} />
          <span>Intelligent Multi-Model Gateway</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          How can I help you today,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
            {userName}
          </span>
          ?
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
          Start a new conversation thread or select an enterprise orchestration prompt below to test your LLM Gateway.
        </p>
      </div>

      {/* 4 Interactive Prompt Starter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 w-full text-left">
        {starters.map((starter, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectPrompt(starter.prompt)}
            className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 hover:border-indigo-500/50 transition-all duration-200 active:scale-[0.99] text-left cursor-pointer shadow-sm hover:shadow-indigo-500/5"
          >
            <div className="flex items-start justify-between w-full">
              <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-colors">
                {starter.icon}
              </div>
              <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase px-2 py-0.5 rounded bg-zinc-950/60 border border-zinc-800/80">
                {starter.category}
              </span>
            </div>

            <div className="mt-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  {starter.title}
                </h3>
                <ArrowRightIcon
                  size={12}
                  className="text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all"
                />
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                {starter.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

