"use client";

import React, { useState } from "react";
import { PdfQuery } from "@/types/pdfChat";
import {
  BotIcon,
  CopyIcon,
  CheckIcon,
  RefreshCwIcon,
  SparklesIcon,
  BookOpenIcon,
  AlertCircleIcon,
  SpinnerIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from "@/components/icons";

interface PdfQueryItemProps {
  query: PdfQuery;
  userName?: string;
  onRetry?: () => void;
}

export function PdfQueryItem({ query, userName = "You", onRetry }: PdfQueryItemProps) {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleCopy = () => {
    if (query.answer) {
      navigator.clipboard.writeText(query.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4 py-4 animate-fadeIn">
      {/* 1. User Question Card */}
      <div className="flex justify-end px-4 sm:px-6">
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-3.5 sm:p-4 text-xs sm:text-sm shadow-md shadow-indigo-600/15 leading-relaxed">
            <p className="whitespace-pre-wrap">{query.question}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* 2. RAG Assistant Answer Card */}
      <div className="flex justify-start px-4 sm:px-6">
        <div className="max-w-3xl w-full flex items-start gap-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/30 backdrop-blur-md">
          {/* RAG Bot Avatar */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0 mt-0.5">
            <BotIcon size={16} />
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            {/* Meta Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">RAG Synthesis Engine</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <SparklesIcon size={10} />
                  Context-Grounded
                </span>
              </div>

              {/* Latency & Tokens */}
              <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500">
                {query.latencyMs && (
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                    {query.latencyMs} ms
                  </span>
                )}
                {query.tokensUsed && (
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                    {query.tokensUsed} tokens
                  </span>
                )}
              </div>
            </div>

            {/* Answer Content / Loading State */}
            {query.status === "pending" ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-2.5 text-center">
                <SpinnerIcon size={24} className="text-indigo-400" />
                <p className="text-xs text-zinc-300 font-medium animate-pulse">
                  Querying document vector index...
                </p>
                <p className="text-[11px] text-zinc-500">
                  Retrieving top matching chunks & generating response
                </p>
              </div>
            ) : query.status === "failed" ? (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircleIcon size={15} className="text-red-400" />
                  <span>Query Execution Failed</span>
                </div>
                <p className="text-zinc-400">
                  {query.errorMessage || "Unable to retrieve semantic answer from backend."}
                </p>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-1 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-red-500/30 text-[11px] font-medium text-white transition-colors"
                  >
                    Retry Query
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Formatted Markdown Content */}
                <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed space-y-2.5">
                  <FormattedAnswer content={query.answer || ""} />
                </div>

                {/* Source Citations Accordion */}
                {query.sources && query.sources.length > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSources(!showSources)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 text-[11px] font-medium text-indigo-300 hover:text-indigo-200 transition-all cursor-pointer"
                    >
                      <BookOpenIcon size={13} className="text-indigo-400" />
                      <span>
                        {showSources ? "Hide" : "View"} {query.sources.length} Source Citations
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        ({Math.round((query.sources[0]?.score || 0.9) * 100)}% match)
                      </span>
                    </button>

                    {showSources && (
                      <div className="mt-2.5 space-y-2 animate-fadeIn">
                        {query.sources.map((source, sIdx) => (
                          <div
                            key={source.id || sIdx}
                            className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/90 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-zinc-200">
                                {source.section || `Chunk #${sIdx + 1}`}
                              </span>
                              <div className="flex items-center gap-2">
                                {source.pageNumber && (
                                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">
                                    Page {source.pageNumber}
                                  </span>
                                )}
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20 font-semibold">
                                  {Math.round(source.score * 100)}% match
                                </span>
                              </div>
                            </div>
                            <blockquote className="border-l-2 border-indigo-500/60 pl-2.5 text-[11px] text-zinc-400 italic font-sans leading-relaxed">
                              &ldquo;{source.content}&rdquo;
                            </blockquote>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-xs text-zinc-400">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-[11px]"
                      title="Copy response"
                    >
                      {copied ? (
                        <>
                          <CheckIcon size={12} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon size={12} />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>

                    {onRetry && (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[11px]"
                        title="Re-query document"
                      >
                        <RefreshCwIcon size={12} />
                        <span>Re-query</span>
                      </button>
                    )}
                  </div>

                  {/* Feedback Thumbs */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setFeedback(feedback === "up" ? null : "up")}
                      className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                        feedback === "up" ? "text-emerald-400" : "text-zinc-500"
                      }`}
                      title="Helpful response"
                    >
                      <ThumbsUpIcon size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedback(feedback === "down" ? null : "down")}
                      className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                        feedback === "down" ? "text-red-400" : "text-zinc-500"
                      }`}
                      title="Not helpful"
                    >
                      <ThumbsDownIcon size={13} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Formats Markdown elements in PDF answers (headings, lists, bold, tables, inline code)
 */
function FormattedAnswer({ content }: { content: string }) {
  // Check for markdown tables
  const lines = content.split("\n");
  const tableStartIndex = lines.findIndex((l) => l.trim().startsWith("|") && l.includes("|"));

  if (tableStartIndex !== -1) {
    // Collect table lines
    const tableEndIndex = lines.slice(tableStartIndex).findIndex((l) => !l.trim().startsWith("|"));
    const tableLines =
      tableEndIndex === -1
        ? lines.slice(tableStartIndex)
        : lines.slice(tableStartIndex, tableStartIndex + tableEndIndex);

    const beforeText = lines.slice(0, tableStartIndex).join("\n");
    const afterText =
      tableEndIndex === -1 ? "" : lines.slice(tableStartIndex + tableEndIndex).join("\n");

    return (
      <div className="space-y-3">
        {beforeText && <RenderTextBlocks content={beforeText} />}
        <RenderTable tableLines={tableLines} />
        {afterText && <RenderTextBlocks content={afterText} />}
      </div>
    );
  }

  return <RenderTextBlocks content={content} />;
}

function RenderTable({ tableLines }: { tableLines: string[] }) {
  if (tableLines.length < 2) return null;

  const headerCells = tableLines[0]
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);

  const rowLines = tableLines.slice(2); // Skip separator row

  return (
    <div className="overflow-x-auto my-3 rounded-xl border border-zinc-800 bg-zinc-950">
      <table className="w-full text-left text-xs text-zinc-300">
        <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-200">
          <tr>
            {headerCells.map((header, i) => (
              <th key={i} className="px-3.5 py-2 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {rowLines.map((row, rIdx) => {
            const cells = row
              .split("|")
              .map((c) => c.trim())
              .filter(Boolean);
            return (
              <tr key={rIdx} className="hover:bg-zinc-900/50">
                {cells.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3.5 py-2">
                    {renderInlineText(cell)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RenderTextBlocks({ content }: { content: string }) {
  const blocks = content.split("\n\n");

  return (
    <div className="space-y-2.5">
      {blocks.map((block, idx) => {
        if (!block.trim()) return null;

        // Headings
        if (block.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-sm font-bold text-white pt-1">
              {renderInlineText(block.replace("### ", ""))}
            </h3>
          );
        }

        // Bullet / Numbered list
        const lines = block.split("\n");
        const isList = lines.every(
          (l) => l.trim().startsWith("- ") || l.trim().startsWith("* ") || /^\d+\.\s/.test(l.trim())
        );

        if (isList) {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1 text-zinc-300">
              {lines.map((l, lIdx) => {
                const clean = l.replace(/^[-*]\s+|\d+\.\s+/, "");
                return <li key={lIdx}>{renderInlineText(clean)}</li>;
              })}
            </ul>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineText(block)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineText(text: string): React.ReactNode {
  // Split inline code
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((cPart, cIdx) => {
    if (cPart.startsWith("`") && cPart.endsWith("`")) {
      return (
        <code
          key={cIdx}
          className="px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-300 font-mono text-[11px] border border-zinc-700/60"
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
