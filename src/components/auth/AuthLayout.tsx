import React from "react";
import Link from "next/link";
import {
  BotIcon,
  SparklesIcon,
  ShieldCheckIcon,
  MessageSquareIcon,
  FileTextIcon,
} from "@/components/icons";

interface AuthLayoutProps {
  children: React.ReactNode;
  activeTab: "login" | "register";
  title: string;
  subtitle: string;
}

export function AuthLayout({
  children,
  activeTab,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="relative h-dvh w-full bg-[#090a0f] text-zinc-100 overflow-y-auto overflow-x-hidden font-sans">
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[160px]" />

      <main className="relative z-10 w-full max-w-5xl mx-auto min-h-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start lg:items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <section className="lg:col-span-6 flex flex-col justify-center space-y-8 p-2 sm:p-4">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-wide">
              <SparklesIcon size={14} className="text-indigo-400" />
              <span>LLM Gateway</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                  <BotIcon size={28} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  LLM Gateway
                </h1>
              </div>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md">
                Sign in to chat with AI, keep your conversations, and ask questions about your PDFs.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                  <MessageSquareIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">AI Chat</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-normal">
                    Start a conversation, just like ChatGPT, and pick up where you left off.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 mt-0.5">
                  <FileTextIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Chat with PDFs</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-normal">
                    Upload a PDF and ask questions about it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-6 w-full max-w-md mx-auto pb-8 lg:pb-0">
          <div className="relative rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-2xl shadow-black/60 backdrop-blur-xl p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            <div className="mb-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
              </div>

              <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-950/80 border border-zinc-800/60 text-xs font-medium">
                <Link
                  href="/login"
                  className={`py-2 text-center rounded-lg transition-all duration-200 ${
                    activeTab === "login"
                      ? "bg-zinc-800 text-white shadow-sm font-semibold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className={`py-2 text-center rounded-lg transition-all duration-200 ${
                    activeTab === "register"
                      ? "bg-zinc-800 text-white shadow-sm font-semibold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Create Account
                </Link>
              </div>
            </div>

            {children}

            <div className="mt-6 pt-5 border-t border-zinc-800/60 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheckIcon size={14} className="text-zinc-400" />
              <span>Secure sign-in</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
