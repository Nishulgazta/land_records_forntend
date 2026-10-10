import type { ProcessingJob } from "../types";
import { ApiError } from "../types";
import { IS_MOCK_MODE, apiFetch } from "./client";
import {
  getJob as getMockJob,
  getJobForDocument as getMockJobForDocument,
  MOCK_PROCESSING_JOBS,
} from "../mock/documents";

export interface ProcessingFilters {
  stage?: ProcessingJob["stage"] | "all";
  query?: string;
}

export function matchesProcessingFilters(
  job: ProcessingJob,
  filters: ProcessingFilters,
): boolean {
  if (filters.stage && filters.stage !== "all" && job.stage !== filters.stage) {
    return false;
  }
  const query = filters.query?.trim().toLowerCase();
  if (query) {
    const haystack = `${job.id} ${job.documentId}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

export async function listProcessingJobs(
  filters: ProcessingFilters = {},
): Promise<ProcessingJob[]> {
  if (IS_MOCK_MODE) {
    return [...MOCK_PROCESSING_JOBS]
      .sort((a, b) => new Date(b.queuedAt).getTime() - new Date(a.queuedAt).getTime())
      .filter((job) => matchesProcessingFilters(job, filters));
  }
  const params = new URLSearchParams();
  if (filters.stage && filters.stage !== "all") params.set("stage", filters.stage);
  if (filters.query) params.set("q", filters.query);
  const query = params.toString();
  return apiFetch<ProcessingJob[]>(`/processing${query ? `?${query}` : ""}`);
}

export async function getProcessingJob(id: string): Promise<ProcessingJob> {
  if (IS_MOCK_MODE) {
    const job = getMockJob(id) ?? (await getMockJobForDocument(id));
    if (!job) {
      throw new ApiError(`Processing job ${id} not found`, `/processing/${id}`, 404);
    }
    return job;
  }
  return apiFetch<ProcessingJob>(`/processing/${id}`);
}

export async function getProcessingJobForDocument(
  documentId: string,
): Promise<ProcessingJob> {
  if (IS_MOCK_MODE) {
    const job = getMockJobForDocument(documentId);
    if (!job) {
      throw new ApiError(
        `No processing job for document ${documentId}`,
        `/processing?documentId=${documentId}`,
        404,
      );
    }
    return job;
  }
  return apiFetch<ProcessingJob>(`/processing?documentId=${documentId}`);
}
