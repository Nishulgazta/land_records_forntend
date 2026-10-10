import type { LandDocument, DocumentType, ProcessingStage } from "../types";
import { ApiError } from "../types";
import { API_BASE_URL, IS_MOCK_MODE, apiFetch } from "./client";
import { getDocument as getMockDocument, MOCK_DOCUMENTS } from "../mock/documents";

export interface DocumentFilters {
  query?: string;
  type?: DocumentType | "all";
  stage?: ProcessingStage | "all";
  confidence?: "all" | "high" | "medium" | "low" | "unavailable";
}

export function matchesDocumentFilters(
  doc: LandDocument,
  filters: DocumentFilters,
): boolean {
  const query = filters.query?.trim().toLowerCase();
  if (query) {
    const haystack = `${doc.title} ${doc.fileName} ${doc.id} ${doc.archiveRef}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (filters.type && filters.type !== "all" && doc.type !== filters.type) {
    return false;
  }
  if (filters.stage && filters.stage !== "all" && doc.stage !== filters.stage) {
    return false;
  }
  if (filters.confidence && filters.confidence !== "all") {
    const value = doc.confidence;
    if (filters.confidence === "unavailable" && value !== null) return false;
    if (filters.confidence === "high" && !(value !== null && value >= 0.85)) return false;
    if (filters.confidence === "medium" && !(value !== null && value >= 0.7 && value < 0.85)) {
      return false;
    }
    if (filters.confidence === "low" && !(value !== null && value < 0.7)) return false;
  }
  return true;
}

export async function listDocuments(
  filters: DocumentFilters = {},
): Promise<LandDocument[]> {
  if (IS_MOCK_MODE) {
    const all = [...MOCK_DOCUMENTS].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
    return all.filter((doc) => matchesDocumentFilters(doc, filters));
  }
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.stage && filters.stage !== "all") params.set("stage", filters.stage);
  const query = params.toString();
  return apiFetch<LandDocument[]>(`/documents${query ? `?${query}` : ""}`);
}

export async function getDocumentById(id: string): Promise<LandDocument> {
  if (IS_MOCK_MODE) {
    const doc = getMockDocument(id);
    if (!doc) throw new ApiError(`Document ${id} not found`, `/documents/${id}`, 404);
    return doc;
  }
  return apiFetch<LandDocument>(`/documents/${id}`);
}

export interface UploadTicket {
  documentId: string;
  simulated: boolean;
}

/**
 * Upload a document. In mock mode nothing leaves the browser: the progress
 * is simulated locally and the resulting document is a sample record.
 */
export async function uploadDocument(
  file: File,
  type: DocumentType,
  options: {
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
  } = {},
): Promise<UploadTicket> {
  if (!IS_MOCK_MODE) {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    const xhr = new XMLHttpRequest();
    const result = await new Promise<UploadTicket>((resolve, reject) => {
      xhr.open("POST", `${API_BASE_URL ?? ""}/documents`);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && options.onProgress) {
          options.onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as UploadTicket);
        } else {
          reject(new ApiError(`Upload failed (${xhr.status})`, "/documents", xhr.status));
        }
      };
      xhr.onerror = () => reject(new ApiError("Upload failed", "/documents", 0));
      options.signal?.addEventListener("abort", () => {
        xhr.abort();
        reject(new ApiError("Upload cancelled", "/documents", 0));
      });
      xhr.send(form);
    });
    return result;
  }

  const steps = 20;
  for (let i = 1; i <= steps; i += 1) {
    if (options.signal?.aborted) {
      throw new ApiError("Upload cancelled", "mock://documents", 0);
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 70));
    options.onProgress?.(Math.round((i / steps) * 100));
  }

  return {
    documentId: `DOC-MOCK-${Date.now().toString(36).toUpperCase()}`,
    simulated: true,
  };
}
