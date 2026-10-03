"use client";

import React from "react";
import { usePdfChat } from "@/context/PdfChatContext";
import { useNavigation } from "@/context/NavigationContext";
import {
  FileTextIcon,
  PlusIcon,
  CheckCircleIcon,
  TrashIcon,
  SpinnerIcon,
  MessageSquareIcon,
} from "@/components/icons";

export function PdfSidebarContent() {
  const {
    documents,
    activeDocument,
    selectDocument,
    startNewUpload,
    deleteDocument,
    isUploading,
  } = usePdfChat();

  const { setActiveMode } = useNavigation();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Upload Button */}
      <div className="p-3.5 border-b border-zinc-800/40 space-y-2">
        <button
          type="button"
          onClick={startNewUpload}
          disabled={isUploading}
          className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 group"
        >
          <div className="flex items-center gap-2">
            <PlusIcon size={16} className="transition-transform group-hover:rotate-90" />
            <span>Upload New PDF</span>
          </div>
          <FileTextIcon size={14} className="text-indigo-200" />
        </button>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-2 select-none scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase font-mono flex items-center justify-between">
          <span>Uploaded Documents</span>
          <span className="text-zinc-600">{documents.length}</span>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8 px-4 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800/80 text-zinc-500 mx-auto flex items-center justify-center">
              <FileTextIcon size={18} />
            </div>
            <p className="text-xs text-zinc-400 font-medium">No PDFs uploaded</p>
            <p className="text-[11px] text-zinc-600">
              Upload a document to start asking questions
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {documents.map((doc) => {
              const isActive =
                activeDocument &&
                (activeDocument.documentId === doc.documentId || activeDocument.id === doc.id);

              return (
                <div
                  key={doc.documentId || doc.id}
                  onClick={() => selectDocument(doc.documentId || doc.id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-zinc-900 text-white font-medium border border-indigo-500/40 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isActive
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "bg-zinc-900 text-zinc-500 group-hover:text-zinc-300"
                      }`}
                    >
                      <FileTextIcon size={14} />
                    </div>
                    <div className="truncate">
                      <span className="block truncate leading-snug font-medium">
                        {doc.fileName || doc.name}
                      </span>
                      <span className="block truncate text-[10px] font-mono text-zinc-500">
                        ID: {(doc.documentId || doc.id).slice(0, 8)}...
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {doc.status === "ready" && (
                      <CheckCircleIcon size={12} className="text-emerald-400 shrink-0" />
                    )}
                    {doc.status === "uploading" && (
                      <SpinnerIcon size={12} className="text-indigo-400 shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete PDF "${doc.fileName || doc.name}"?`)) {
                          deleteDocument(doc.documentId || doc.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-opacity"
                      title="Delete PDF"
                    >
                      <TrashIcon size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Switch to AI Chat shortcut footer button */}
      <div className="p-3 border-t border-zinc-800/40">
        <button
          type="button"
          onClick={() => setActiveMode("chat")}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
        >
          <MessageSquareIcon size={14} className="text-indigo-400" />
          <span>Switch to AI Chat</span>
        </button>
      </div>
    </div>
  );
}
