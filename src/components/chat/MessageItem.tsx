"use client";

import React, { useState } from "react";
import { Message } from "@/types/chat";
import {
  BotIcon,
  CopyIcon,
  CheckIcon,
  RefreshCwIcon,
  SparklesIcon,
} from "@/components/icons";

interface MessageItemProps {
  message: Message;
  userName?: string;
  onRetry?: () => void;
}

/**
 * Clean markdown-like parser that formats code blocks, bold, lists, and paragraphs.
 */
function FormattedContent({ content }: { content: string }) {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Split by triple backticks for code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-sm text-zinc-200">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Code block
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0].trim();
          const language = /^[a-zA-Z0-9_+-]+$/.test(firstLine) ? firstLine : "code";
          const codeBody = /^[a-zA-Z0-9_+-]+$/.test(firstLine)
            ? lines.slice(1).join("\n")
            : lines.join("\n");

          const isCopied = copiedCodeIndex === index;

          return (
            <div
              key={index}
              className="my-3 rounded-xl bg-zinc-950 border border-zinc-800/90 overflow-hidden shadow-md"
            >
              {/* Code Block Header */}
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900/90 border-b border-zinc-800/80 text-xs text-zinc-400">
                <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                  {language}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeBody, index)}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <CheckIcon size={12} className="text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={12} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Block Content */}
              <div className="p-3.5 overflow-x-auto font-mono text-xs text-zinc-200 bg-zinc-950/90 leading-normal">
                <pre>
                  <code>{codeBody}</code>
                </pre>
              </div>
            </div>
          );
        }

        // Regular text formatting (paragraphs, lists, bold)
        const paragraphs = part.split("\n\n");

        return (
          <React.Fragment key={index}>
            {paragraphs.map((para, pIdx) => {
              if (!para.trim()) return null;

              // Bullet list check
              const lines = para.split("\n");
              const isList = lines.every(
                (l) => l.trim().startsWith("- ") || l.trim().startsWith("* ") || /^\d+\.\s/.test(l.trim())
              );

              if (isList) {
                return (
                  <ul key={pIdx} className="list-disc pl-5 space-y-1 text-zinc-300">
                    {lines.map((l, lIdx) => {
                      const clean = l.replace(/^[-*]\s+|\d+\.\s+/, "");
                      return <li key={lIdx}>{renderInlineMarkdown(clean)}</li>;
                    })}
                  </ul>
                );
              }

              return (
                <p key={pIdx} className="leading-relaxed">
                  {renderInlineMarkdown(para)}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * Formats inline bold (**text**), italics (*text*), and inline code (`code`)
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Inline code splitting
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((cPart, cIdx) => {
    if (cPart.startsWith("`") && cPart.endsWith("`")) {
      return (
        <code
          key={cIdx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-zinc-800 text-indigo-300 font-mono text-[12px] border border-zinc-700/60"
        >
          {cPart.slice(1, -1)}
        </code>
      );
    }

    // Bold splitting
    const boldParts = cPart.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith("**") && bPart.endsWith("**")) {
        return (
          <strong key={bIdx} className="font-semibold text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  });
}

export function MessageItem({ message, userName = "User", onRetry }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end py-3 px-4 sm:px-6">
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="group relative rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-3.5 sm:p-4 text-sm shadow-md shadow-indigo-600/15 leading-relaxed">
            <p className="whitespace-pre-wrap">{message.content}</p>

            {/* Hover copy button */}
            <button
              onClick={handleCopyMessage}
              className="absolute -left-8 top-3 opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-500 hover:text-zinc-200 transition-all"
              title="Copy prompt"
            >
              {copied ? <CheckIcon size={13} className="text-emerald-400" /> : <CopyIcon size={13} />}
            </button>
          </div>

          {/* User Initial Avatar */}
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex justify-start py-4 px-4 sm:px-6 bg-zinc-950/40 border-y border-zinc-900/60">
      <div className="flex items-start gap-3.5 max-w-3xl w-full">
        {/* Assistant Logo Badge */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0 mt-0.5">
          <BotIcon size={16} />
        </div>

        {/* Assistant Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">LLM Gateway</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified Response
            </span>
          </div>

          {/* Content */}
          <FormattedContent content={message.content} />

          {/* Bottom Actions Bar */}
          <div className="flex items-center gap-3 pt-2 text-[11px] text-zinc-500 border-t border-zinc-900/80">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
              title="Copy response"
            >
              {copied ? (
                <>
                  <CheckIcon size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>

            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                title="Retry response"
              >
                <RefreshCwIcon size={12} />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

