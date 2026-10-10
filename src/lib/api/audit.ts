import type { AuditEvent } from "../types";
import { IS_MOCK_MODE, apiFetch } from "./client";
import { MOCK_AUDIT_EVENTS } from "../mock/audit";
import type { AuditEventType, Severity } from "../types";

export interface AuditFilters {
  query?: string;
  type?: AuditEventType | "all";
  severity?: Severity | "all";
}

export function matchesAuditFilters(event: AuditEvent, filters: AuditFilters): boolean {
  const query = filters.query?.trim().toLowerCase();
  if (query) {
    const haystack = `${event.id} ${event.actor} ${event.relatedLabel} ${event.detail} ${event.type}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (filters.type && filters.type !== "all" && event.type !== filters.type) return false;
  if (filters.severity && filters.severity !== "all" && event.severity !== filters.severity) {
    return false;
  }
  return true;
}

export async function listAuditEvents(filters: AuditFilters = {}): Promise<AuditEvent[]> {
  if (IS_MOCK_MODE) {
    return MOCK_AUDIT_EVENTS.filter((event) => matchesAuditFilters(event, filters));
  }
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.severity && filters.severity !== "all") params.set("severity", filters.severity);
  const query = params.toString();
  return apiFetch<AuditEvent[]>(`/audit${query ? `?${query}` : ""}`);
}
