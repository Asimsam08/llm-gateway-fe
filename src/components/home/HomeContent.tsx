"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { ChatInterface } from "@/components/chat/ChatInterface";
import {
  BotIcon,
  SparklesIcon,
  ArrowRightIcon,
  SpinnerIcon,
  MessageSquareIcon,
  FileTextIcon,
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
          <span>Loading...</span>
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

  // Unauthenticated State: scrollable landing. The app shell locks the body
  // so chat can own its own scroll; this page must scroll inside that shell.
  return (
    <div className="flex-1 min-h-0 h-full overflow-y-auto overflow-x-hidden bg-[#090a0f] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="flex min-h-full flex-col">
        <header className="sticky top-0 z-50 shrink-0 border-b border-zinc-800/80 bg-[#090a0f]/80 backdrop-blur-xl relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="shrink-0 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 text-white shadow-lg shadow-indigo-500/25">
                <BotIcon size={20} />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-semibold tracking-tight text-white sm:text-base">
                  LLM Gateway
                </div>
                <div className="hidden text-[11px] text-zinc-500 sm:block">
                  AI chat and PDF answers
                </div>
              </div>
            </Link>

            <nav className="flex shrink-0 items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white sm:px-3.5"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:from-indigo-600 hover:to-violet-700 active:scale-[0.98] sm:px-3.5"
              >
                <span className="sm:hidden">Sign Up</span>
                <span className="hidden sm:inline">Create Account</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="relative flex-1">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[min(100%,720px)] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-600/10 blur-[120px]" />

          <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-medium text-indigo-400">
                <SparklesIcon size={14} />
                <span>AI Chat & PDF Chat</span>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Chat with AI.{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Ask your PDFs anything.
                </span>
              </h1>

              <p className="mx-auto max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                Sign in to start a conversation, keep your chat history, and upload PDFs to get answers from your documents.
              </p>

              <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-3.5 text-xs font-semibold text-white shadow-xl shadow-indigo-600/25 transition-all hover:from-indigo-600 hover:to-violet-700 hover:shadow-indigo-600/35 active:scale-[0.98] sm:w-auto"
                >
                  <span>Sign In</span>
                  <ArrowRightIcon size={14} />
                </Link>
                <Link
                  href="/register"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-7 py-3.5 text-xs font-medium text-zinc-200 transition-all hover:border-zinc-700 hover:bg-zinc-800 sm:w-auto"
                >
                  <span>Create Free Account</span>
                </Link>
              </div>
            </div>

            <div className="relative z-10 mx-auto mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 text-left md:grid-cols-2">
              <div className="space-y-2.5 rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-5 backdrop-blur-md">
                <div className="w-fit rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-400">
                  <MessageSquareIcon size={18} />
                </div>
                <h3 className="text-sm font-semibold text-white">AI Chat</h3>
                <p className="text-xs leading-relaxed text-zinc-400">
                  Have a conversation and pick up where you left off anytime.
                </p>
              </div>

              <div className="space-y-2.5 rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-5 backdrop-blur-md">
                <div className="w-fit rounded-xl border border-violet-500/20 bg-violet-500/10 p-2 text-violet-400">
                  <FileTextIcon size={18} />
                </div>
                <h3 className="text-sm font-semibold text-white">PDF Chat</h3>
                <p className="text-xs leading-relaxed text-zinc-400">
                  Upload a document and ask questions about what is inside it.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
