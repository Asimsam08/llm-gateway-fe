"use client";

import React from "react";
import { usePdfChat } from "@/context/PdfChatContext";
import { FileTextIcon, CheckCircleIcon, AlertCircleIcon, SpinnerIcon } from "@/components/icons";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function PdfDocumentCard() {
  const { activeDocument } = usePdfChat();

  if (!activeDocument || activeDocument.status !== "ready") return null;

  return (
    <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-md backdrop-blur-md">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-red-500/20 to-indigo-500/20 border border-red-500/30 text-red-400 shrink-0">
          <FileTextIcon size={24} />
        </div>

        <div className="min-w-0 space-y-0.5 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h3
              className="text-sm font-bold text-white truncate"
              title={activeDocument.name}
            >
              {activeDocument.name}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <CheckCircleIcon size={11} />
              Ready
            </span>
          </div>

          <p className="text-xs text-zinc-400 flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span>{formatFileSize(activeDocument.size)}</span>
            <span className="text-zinc-600">•</span>
            <span>{activeDocument.pages || 1} pages</span>
            {activeDocument.chunksCount ? (
              <>
                <span className="text-zinc-600">•</span>
                <span>{activeDocument.chunksCount} chunks</span>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PdfProcessingPanel() {
  const { activeDocument, uploadProgress, startNewUpload, deleteDocument } = usePdfChat();

  if (!activeDocument) return null;
  if (activeDocument.status === "ready") return null;

  const isFailed = activeDocument.status === "failed";
  const progress =
    activeDocument.status === "uploading"
      ? activeDocument.uploadProgress ?? uploadProgress
      : Math.max(uploadProgress, 70);

  const steps = [
    { key: "upload", label: "Upload file" },
    { key: "extract", label: "Extract text" },
    { key: "index", label: "Index for chat" },
  ];

  const activeStep =
    activeDocument.status === "uploading" ? 0 : activeDocument.status === "processing" ? 1 : 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-5 text-center">
        <div
          className={`mx-auto p-3 rounded-2xl w-fit ${
            isFailed
              ? "bg-red-500/10 border border-red-500/20 text-red-400"
              : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
          }`}
        >
          {isFailed ? <AlertCircleIcon size={28} /> : <SpinnerIcon size={28} />}
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">
            {isFailed ? "Processing failed" : "Preparing your PDF"}
          </h2>
          <p className="text-xs text-zinc-400 truncate" title={activeDocument.name}>
            {activeDocument.name}
          </p>
          <p className="text-xs text-zinc-500">
            {isFailed
              ? activeDocument.errorMessage || "Upload or indexing did not complete."
              : activeDocument.processingStep || "Please wait while the document is indexed."}
          </p>
        </div>

        {!isFailed && (
          <>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                style={{ width: `${Math.min(progress, 95)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-zinc-500">
              {steps.map((step, index) => (
                <div
                  key={step.key}
                  className={index <= activeStep + (progress >= 100 ? 1 : 0) ? "text-indigo-300" : ""}
                >
                  {step.label}
                </div>
              ))}
            </div>
          </>
        )}

        {isFailed && (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={startNewUpload}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Try another PDF
            </button>
            <button
              type="button"
              onClick={() => deleteDocument(activeDocument.id)}
              className="px-3 py-1.5 rounded-xl border border-zinc-800 text-xs text-zinc-300"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
