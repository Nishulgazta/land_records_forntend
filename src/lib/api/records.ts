import type { LandRecord, RecordStatus } from "../types";
import { ApiError } from "../types";
import { IS_MOCK_MODE, apiFetch } from "./client";
import { getRecord as getMockRecord, MOCK_RECORDS } from "../mock/records";

export interface RecordFilters {
  query?: string;
  status?: RecordStatus | "all";
  district?: string | "all";
  confidence?: "all" | "high" | "medium" | "low";
}

export function matchesRecordFilters(
  record: LandRecord,
  filters: RecordFilters,
): boolean {
  const query = filters.query?.trim().toLowerCase();
  if (query) {
    const haystack = [
      record.id,
      record.surveyNumber,
      record.subdivisionNumber ?? "",
      record.village,
      record.mandal,
      record.district,
      record.landholder,
      record.landClassification,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (filters.status && filters.status !== "all" && record.status !== filters.status) {
    return false;
  }
  if (filters.district && filters.district !== "all" && record.district !== filters.district) {
    return false;
  }
  if (filters.confidence && filters.confidence !== "all") {
    if (filters.confidence === "high" && record.confidence < 0.85) return false;
    if (filters.confidence === "medium" && !(record.confidence >= 0.7 && record.confidence < 0.85)) {
      return false;
    }
    if (filters.confidence === "low" && record.confidence >= 0.7) return false;
  }
  return true;
}

export async function listRecords(filters: RecordFilters = {}): Promise<LandRecord[]> {
  if (IS_MOCK_MODE) {
    return [...MOCK_RECORDS]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .filter((record) => matchesRecordFilters(record, filters));
  }
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.district && filters.district !== "all") params.set("district", filters.district);
  const query = params.toString();
  return apiFetch<LandRecord[]>(`/records${query ? `?${query}` : ""}`);
}

export async function getRecordById(id: string): Promise<LandRecord> {
  if (IS_MOCK_MODE) {
    const record = getMockRecord(id);
    if (!record) throw new ApiError(`Record ${id} not found`, `/records/${id}`, 404);
    return record;
  }
  return apiFetch<LandRecord>(`/records/${id}`);
}
