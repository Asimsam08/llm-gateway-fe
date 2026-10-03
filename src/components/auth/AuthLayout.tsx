import React from "react";
import Link from "next/link";
import { BotIcon, SparklesIcon, CpuIcon, ShieldCheckIcon, ZapIcon, LayersIcon } from "@/components/icons";

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
    <div className="relative min-h-screen w-full bg-[#090a0f] text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[160px]" />

      <main className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Brand & Feature Highlights (Server-rendered SSR) */}
        <section className="lg:col-span-6 flex flex-col justify-between space-y-8 p-4 sm:p-6">
          <div className="space-y-6">
            {/* Logo Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-wide">
              <SparklesIcon size={14} className="text-indigo-400" />
              <span>Next-Gen LLM Gateway</span>
            </div>

            {/* Title & Tagline */}
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
                Unified orchestration interface for robust LLM routing, token budget control, and resilient context management.
              </p>
            </div>

            {/* Architecture Feature Cards */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700/80 transition-colors">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                  <CpuIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Token Budget & Context Optimization
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-normal">
                    Real-time token monitoring and automated sliding context windows to minimize latency and cost.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700/80 transition-colors">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 mt-0.5">
                  <ZapIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Zero-Drop Retries & Model Routing
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-normal">
                    Intelligent rate limit recovery, exponential backoff, and graceful multi-provider fallbacks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700/80 transition-colors">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                  <LayersIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Persistent Conversations & Message Sync
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-normal">
                    Stateful conversation histories organized effortlessly with ChatGPT-grade responsiveness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Uptime / Gateway Status Badge */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-900">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LLM Gateway Core: v1.0.0 • Connected</span>
          </div>
        </section>

        {/* Right Side: Glassmorphism Auth Card */}
        <section className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="relative rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-2xl shadow-black/60 backdrop-blur-xl p-6 sm:p-8">
            {/* Ambient inner glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            {/* Card Header & Tab Switcher */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    {subtitle}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs (Server Links) */}
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

            {/* Interactive Form (Client Component) */}
            {children}

            {/* Security Footer Note */}
            <div className="mt-6 pt-5 border-t border-zinc-800/60 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheckIcon size={14} className="text-zinc-400" />
              <span>End-to-end token security & rate limit protection</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

