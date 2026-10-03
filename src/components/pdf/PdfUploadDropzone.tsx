"use client";

import React, { useRef, useState } from "react";
import { usePdfChat } from "@/context/PdfChatContext";
import { UploadCloudIcon, SpinnerIcon, AlertCircleIcon } from "@/components/icons";

export function PdfUploadDropzone() {
  const { uploadDocument, isUploading, uploadProgress } = usePdfChat();
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please select a valid PDF file (.pdf)");
      return;
    }
    setErrorMsg(null);
    void uploadDocument(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative group rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-200 cursor-pointer overflow-hidden ${
          isDragOver
            ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
            : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/40"
        } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
      >
        {/* Glow overlay */}
        <div className="pointer-events-none absolute -inset-px bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleChange}
          disabled={isUploading}
          className="hidden"
        />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div
            className={`p-4 rounded-2xl transition-transform duration-200 group-hover:scale-110 ${
              isUploading
                ? "bg-indigo-500/20 text-indigo-400"
                : "bg-gradient-to-tr from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 text-indigo-400"
            }`}
          >
            {isUploading ? (
              <SpinnerIcon size={32} />
            ) : (
              <UploadCloudIcon size={32} />
            )}
          </div>

          {isUploading ? (
            <div className="space-y-2 max-w-xs">
              <h3 className="text-base font-semibold text-white">Uploading Document...</h3>
              <p className="text-xs text-zinc-400">
                Please wait while we send your PDF to the server. Chat will be enabled right after.
              </p>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-[11px] text-zinc-500 font-mono block">
                {uploadProgress}%
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white">
                Drop your <span className="text-indigo-400">PDF document</span> here
              </h3>
              <p className="text-xs text-zinc-400">
                or click to browse files from your computer
              </p>
              <p className="text-[11px] text-zinc-500 font-mono pt-1">
                Supports any PDF file up to 50MB
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl">
              <AlertCircleIcon size={14} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
