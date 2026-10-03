"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { PdfDocument, PdfQuery } from "@/types/pdfChat";
import { pdfService } from "@/services/pdfService";

interface PdfChatContextType {
  documents: PdfDocument[];
  activeDocument: PdfDocument | null;
  queries: PdfQuery[];
  isUploading: boolean;
  uploadProgress: number;
  isQuerying: boolean;
  isLoadingQueries: boolean;
  uploadDocument: (file: File) => Promise<void>;
  selectDocument: (documentId: string) => void;
  askQuestion: (question: string) => Promise<void>;
  retryQuery: (queryId: string) => Promise<void>;
  startNewUpload: () => void;
  deleteDocument: (documentId: string) => void;
}

const PdfChatContext = createContext<PdfChatContextType | undefined>(undefined);

export function PdfChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id || "default_user";

  const [documents, setDocuments] = useState<PdfDocument[]>([]);
  const [activeDocument, setActiveDocument] = useState<PdfDocument | null>(null);
  const [queries, setQueries] = useState<PdfQuery[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [isLoadingQueries, setIsLoadingQueries] = useState<boolean>(false);

  // Load saved documents on mount or user change
  useEffect(() => {
    const docs = pdfService.getDocuments(userId);
    setDocuments(docs);
    if (docs.length > 0 && !activeDocument) {
      setActiveDocument(docs[0]);
    }
  }, [userId]);

  // Load queries whenever activeDocument changes
  useEffect(() => {
    if (activeDocument?.documentId && activeDocument.status === "ready") {
      setIsLoadingQueries(true);
      const qList = pdfService.getQueries(activeDocument.documentId);
      setQueries(qList);
      setIsLoadingQueries(false);
    } else if (!activeDocument || activeDocument.status !== "ready") {
      setQueries([]);
    }
  }, [activeDocument?.documentId, activeDocument?.status]);

  const selectDocument = useCallback(
    (docId: string) => {
      const found = documents.find((d) => d.documentId === docId || d.id === docId);
      if (found) {
        setActiveDocument(found);
      }
    },
    [documents]
  );

  const startNewUpload = useCallback(() => {
    setActiveDocument(null);
    setQueries([]);
  }, []);

  const uploadDocument = useCallback(
    async (file: File) => {
      if (isUploading) return;
      setIsUploading(true);
      setUploadProgress(0);

      const tempId = `temp_${Date.now()}`;
      const tempDoc: PdfDocument = {
        id: tempId,
        documentId: tempId,
        name: file.name,
        fileName: file.name,
        size: file.size,
        status: "uploading",
        uploadedAt: new Date().toISOString(),
        uploadProgress: 0,
        processingStep: "Uploading PDF...",
      };

      setActiveDocument(tempDoc);

      try {
        const { documentId, fileName } = await pdfService.uploadPdf(file, (percent) => {
          setUploadProgress(percent);
          setActiveDocument((prev) =>
            prev && (prev.id === tempId || prev.documentId === tempId)
              ? {
                  ...prev,
                  uploadProgress: percent,
                  status: percent < 100 ? "uploading" : "processing",
                  processingStep:
                    percent < 100 ? `Uploading (${percent}%)` : "Processing PDF & vectors...",
                }
              : prev
          );
        });

        const readyDoc: PdfDocument = {
          id: documentId,
          documentId: documentId,
          name: fileName || file.name,
          fileName: fileName || file.name,
          size: file.size,
          status: "ready",
          uploadedAt: new Date().toISOString(),
        };

        setActiveDocument(readyDoc);
        setDocuments((prev) => {
          const filtered = prev.filter(
            (d) => d.documentId !== tempId && d.documentId !== documentId && d.id !== tempId
          );
          const updated = [readyDoc, ...filtered];
          pdfService.saveDocuments(userId, updated);
          return updated;
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to upload PDF";
        const failedDoc: PdfDocument = {
          ...tempDoc,
          status: "failed",
          errorMessage: errorMsg,
        };
        setActiveDocument(failedDoc);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [isUploading, userId]
  );

  const askQuestion = useCallback(
    async (questionText: string) => {
      if (!activeDocument?.documentId || activeDocument.status !== "ready" || isQuerying) return;

      const docId = activeDocument.documentId;
      const queryId = `q_${Date.now()}`;
      const startTime = Date.now();

      const newQuery: PdfQuery = {
        id: queryId,
        documentId: docId,
        question: questionText,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      setQueries((prev) => {
        const updated = [...prev, newQuery];
        pdfService.saveQueries(docId, updated);
        return updated;
      });

      setIsQuerying(true);

      try {
        const res = await pdfService.askQuestion(docId, questionText);
        const latencyMs = Date.now() - startTime;

        setQueries((prev) => {
          const updated = prev.map((q) =>
            q.id === queryId
              ? {
                  ...q,
                  answer: res.answer,
                  sources: res.sources,
                  status: "completed" as const,
                  latencyMs: res.latencyMs || latencyMs,
                  tokensUsed: res.tokensUsed,
                }
              : q
          );
          pdfService.saveQueries(docId, updated);
          return updated;
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Query execution failed";
        setQueries((prev) => {
          const updated = prev.map((q) =>
            q.id === queryId
              ? {
                  ...q,
                  status: "failed" as const,
                  errorMessage: errorMsg,
                }
              : q
          );
          pdfService.saveQueries(docId, updated);
          return updated;
        });
      } finally {
        setIsQuerying(false);
      }
    },
    [activeDocument, isQuerying]
  );

  const retryQuery = useCallback(
    async (queryId: string) => {
      const queryToRetry = queries.find((q) => q.id === queryId);
      if (queryToRetry) {
        setQueries((prev) => prev.filter((q) => q.id !== queryId));
        await askQuestion(queryToRetry.question);
      }
    },
    [queries, askQuestion]
  );

  const deleteDocument = useCallback(
    (docId: string) => {
      setDocuments((prev) => {
        const updated = prev.filter((d) => d.documentId !== docId && d.id !== docId);
        pdfService.saveDocuments(userId, updated);
        return updated;
      });

      if (activeDocument?.documentId === docId || activeDocument?.id === docId) {
        setActiveDocument(null);
        setQueries([]);
      }
    },
    [activeDocument, userId]
  );

  return (
    <PdfChatContext.Provider
      value={{
        documents,
        activeDocument,
        queries,
        isUploading,
        uploadProgress,
        isQuerying,
        isLoadingQueries,
        uploadDocument,
        selectDocument,
        askQuestion,
        retryQuery,
        startNewUpload,
        deleteDocument,
      }}
    >
      {children}
    </PdfChatContext.Provider>
  );
}

export function usePdfChat(): PdfChatContextType {
  const context = useContext(PdfChatContext);
  if (!context) {
    return {
      documents: [],
      activeDocument: null,
      queries: [],
      isUploading: false,
      uploadProgress: 0,
      isQuerying: false,
      isLoadingQueries: false,
      uploadDocument: async () => {},
      selectDocument: () => {},
      askQuestion: async () => {},
      retryQuery: async () => {},
      startNewUpload: () => {},
      deleteDocument: () => {},
    };
  }
  return context;
}
