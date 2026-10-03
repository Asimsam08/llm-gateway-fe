export interface PdfDocument {
  id: string;
  documentId: string;
  name: string;
  fileName: string;
  size: number;
  pages?: number;
  chunksCount?: number;
  status: "uploading" | "processing" | "ready" | "failed";
  uploadedAt: string;
  errorMessage?: string;
  uploadProgress?: number;
  processingStep?: string;
}

export interface PdfSourceCitation {
  id?: string;
  content: string;
  pageNumber?: number;
  score: number;
  section?: string;
}

export interface PdfQuery {
  id: string;
  documentId: string;
  question: string;
  answer?: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  latencyMs?: number;
  tokensUsed?: number;
  sources?: PdfSourceCitation[];
  errorMessage?: string;
}

export interface UploadPdfApiResponse {
  message?: string;
  data?: {
    message?: string;
    document?: {
      documentId?: string;
      fileName?: string;
    };
    documentId?: string;
    fileName?: string;
  };
  documentId?: string;
  fileName?: string;
}

export interface ChatPdfApiRequest {
  query: string;
  documentId: string;
}

export interface ChatPdfApiResponse {
  answer?: string;
  reply?: string;
  message?: string;
  data?: {
    answer?: string;
    reply?: string;
    sources?: PdfSourceCitation[];
  };
  sources?: PdfSourceCitation[];
  latencyMs?: number;
  tokensUsed?: number;
}
