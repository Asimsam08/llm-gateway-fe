import { request, requestFormData } from "@/lib/api";
import {
  PdfDocument,
  PdfQuery,
  UploadPdfApiResponse,
  ChatPdfApiRequest,
  ChatPdfApiResponse,
  PdfSourceCitation,
} from "@/types/pdfChat";

const PDF_DOCS_KEY_PREFIX = "llm_gateway_pdf_docs_";
const PDF_QUERIES_KEY_PREFIX = "llm_gateway_pdf_queries_";

function getLocalPdfDocuments(userId: string | number): PdfDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${PDF_DOCS_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPdfDocuments(userId: string | number, docs: PdfDocument[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`${PDF_DOCS_KEY_PREFIX}${userId}`, JSON.stringify(docs));
  }
}

function getLocalPdfQueries(documentId: string): PdfQuery[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${PDF_QUERIES_KEY_PREFIX}${documentId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPdfQueries(documentId: string, queries: PdfQuery[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`${PDF_QUERIES_KEY_PREFIX}${documentId}`, JSON.stringify(queries));
  }
}

export const pdfService = {
  getDocuments(userId: string | number): PdfDocument[] {
    return getLocalPdfDocuments(userId);
  },

  /**
   * Upload PDF to POST /api/chatpdf/upload
   * Multipart form data with 'pdf' key.
   */
  async uploadPdf(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ documentId: string; fileName: string }> {
    const formData = new FormData();
    formData.append("pdf", file);

    const res = await requestFormData<UploadPdfApiResponse>(
      "/api/chatpdf/upload",
      formData,
      { onProgress }
    );

    const docData = res.data?.document;
    const documentId =
      docData?.documentId || res.data?.documentId || res.documentId || `doc_${Date.now()}`;
    const fileName =
      docData?.fileName || res.data?.fileName || res.fileName || file.name;

    return { documentId, fileName };
  },

  /**
   * Send question to POST /api/chatpdf/chat
   * Accepts JSON { "query": "...", "documentId": "..." }
   * Response format:
   * {
   *     "message": "Query processed successfully",
   *     "data": {
   *         "message": "Query processed successfully",
   *         "data": "I couldn't find that information."
   *     }
   * }
   */
  async askQuestion(
    documentId: string,
    queryText: string
  ): Promise<{ answer: string; sources?: PdfSourceCitation[]; latencyMs?: number; tokensUsed?: number }> {
    const payload: ChatPdfApiRequest = {
      query: queryText,
      documentId: documentId,
    };

    const res = await request<ChatPdfApiResponse>("/api/chatpdf/chat", {
      method: "POST",
      data: payload,
    });

    let answer = "";

    // 1. Check nested data.data structure as returned by production API
    if (
      typeof res.data === "object" &&
      res.data !== null &&
      "data" in res.data &&
      typeof res.data.data === "string"
    ) {
      answer = res.data.data;
    }
    // 2. Direct string inside res.data
    else if (typeof res.data === "string") {
      answer = res.data;
    }
    // 3. res.answer
    else if (res.answer) {
      answer = res.answer;
    }
    // 4. res.data.answer
    else if (
      typeof res.data === "object" &&
      res.data !== null &&
      "answer" in res.data &&
      typeof res.data.answer === "string"
    ) {
      answer = res.data.answer;
    }
    // 5. res.reply or res.data.reply
    else if (res.reply) {
      answer = res.reply;
    } else if (
      typeof res.data === "object" &&
      res.data !== null &&
      "reply" in res.data &&
      typeof res.data.reply === "string"
    ) {
      answer = res.data.reply;
    }
    // 6. Fallback to res.message only if no data content was found
    else if (res.message) {
      answer = res.message;
    } else {
      answer = "No response returned from PDF Chat server.";
    }

    const sources =
      res.sources ||
      (typeof res.data === "object" && res.data !== null && "sources" in res.data
        ? res.data.sources
        : undefined);

    return {
      answer,
      sources,
      latencyMs: res.latencyMs,
      tokensUsed: res.tokensUsed,
    };
  },

  getQueries(documentId: string): PdfQuery[] {
    return getLocalPdfQueries(documentId);
  },

  saveQueries(documentId: string, queries: PdfQuery[]) {
    saveLocalPdfQueries(documentId, queries);
  },

  saveDocuments(userId: string | number, docs: PdfDocument[]) {
    saveLocalPdfDocuments(userId, docs);
  },
};

