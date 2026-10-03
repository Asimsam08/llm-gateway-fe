"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { ChatInterface } from "@/components/chat/ChatInterface";
import {
  BotIcon,
  SparklesIcon,
  CpuIcon,
  ZapIcon,
  LayersIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  SpinnerIcon,
} from "@/components/icons";

export function HomeContent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 min-h-[100dvh] flex flex-col items-center justify-center space-y-3 bg-[#090a0f] text-zinc-100">
        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
          <BotIcon size={32} />
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <SpinnerIcon size={16} />
          <span>Connecting to LLM Gateway...</span>
        </div>
      </div>
    );
  }

  // Authenticated State: Full-Featured Industry-Grade Chat Interface
  if (isAuthenticated && user) {
    return (
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    );
  }

  // Unauthenticated State: Modern Enterprise Landing Page
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#090a0f] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
              <BotIcon size={20} />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-sm sm:text-base">
                LLM Gateway
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Core v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full flex-1 flex flex-col justify-center text-center relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px]" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <SparklesIcon size={14} />
            <span>Intelligent Multi-Model Gateway & Orchestration</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            The Enterprise Interface for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
              Large Language Models
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Centralize conversation threads, enforce token budgets, and achieve zero-drop resiliency across OpenAI, Gemini, and your private model clusters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all active:scale-[0.98]"
            >
              <span>Open Gateway Console</span>
              <ArrowRightIcon size={14} />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium transition-all"
            >
              <span>Create Free Account</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 text-left relative z-10">
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 backdrop-blur-md space-y-2.5">
            <div className="p-2 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CpuIcon size={18} />
            </div>
            <h3 className="text-sm font-semibold text-white">Dynamic Token Pruning</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automated sliding context windows prevent token exhaustion and slash LLM latency on long threads.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 backdrop-blur-md space-y-2.5">
            <div className="p-2 w-fit rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <ZapIcon size={18} />
            </div>
            <h3 className="text-sm font-semibold text-white">Zero-Drop Retries</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Intelligent exponential backoff loops guarantee upstream 429s and 503s never drop user requests.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 backdrop-blur-md space-y-2.5">
            <div className="p-2 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <LayersIcon size={18} />
            </div>
            <h3 className="text-sm font-semibold text-white">Stateful Conversations</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Organized chronological conversation threads with instant full-text search and copyable code blocks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
