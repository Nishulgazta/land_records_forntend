import type { IssueStatus, Severity, ValidationIssue, ValidationCategory } from "../types";
import { ApiError } from "../types";
import { IS_MOCK_MODE, apiFetch } from "./client";
import { getIssue as getMockIssue, getIssuesForRecord as getMockIssuesForRecord, MOCK_ISSUES, refreshRecordIssueCounts } from "../mock/issues";

export interface IssueFilters {
  query?: string;
  severity?: Severity | "all";
  category?: ValidationCategory | "all";
  status?: IssueStatus | "all";
}

export function matchesIssueFilters(issue: ValidationIssue, filters: IssueFilters): boolean {
  const query = filters.query?.trim().toLowerCase();
  if (query) {
    const haystack = `${issue.id} ${issue.recordId} ${issue.fieldLabel} ${issue.message}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (filters.severity && filters.severity !== "all" && issue.severity !== filters.severity) {
    return false;
  }
  if (filters.category && filters.category !== "all" && issue.category !== filters.category) {
    return false;
  }
  if (filters.status && filters.status !== "all" && issue.status !== filters.status) {
    return false;
  }
  return true;
}

export async function listIssues(filters: IssueFilters = {}): Promise<ValidationIssue[]> {
  if (IS_MOCK_MODE) {
    return [...MOCK_ISSUES]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((issue) => matchesIssueFilters(issue, filters));
  }
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.severity && filters.severity !== "all") params.set("severity", filters.severity);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  const query = params.toString();
  return apiFetch<ValidationIssue[]>(`/validation/issues${query ? `?${query}` : ""}`);
}

export async function listIssuesForRecord(recordId: string): Promise<ValidationIssue[]> {
  if (IS_MOCK_MODE) return getMockIssuesForRecord(recordId);
  return apiFetch<ValidationIssue[]>(`/validation/issues?recordId=${recordId}`);
}

export async function getIssueById(id: string): Promise<ValidationIssue> {
  if (IS_MOCK_MODE) {
    const issue = getMockIssue(id);
    if (!issue) throw new ApiError(`Issue ${id} not found`, `/validation/issues/${id}`, 404);
    return issue;
  }
  return apiFetch<ValidationIssue>(`/validation/issues/${id}`);
}

/**
 * Update an issue's workflow status. In mock mode the change is applied to
 * the in-memory sample dataset for the current session only.
 */
export async function setIssueStatus(
  id: string,
  status: IssueStatus,
): Promise<ValidationIssue> {
  if (IS_MOCK_MODE) {
    const issue = getMockIssue(id);
    if (!issue) throw new ApiError(`Issue ${id} not found`, `/validation/issues/${id}`, 404);
    const updated: ValidationIssue = { ...issue, status };
    const index = MOCK_ISSUES.findIndex((candidate) => candidate.id === id);
    if (index >= 0) MOCK_ISSUES[index] = updated;
    refreshRecordIssueCounts();
    return updated;
  }
  return apiFetch<ValidationIssue>(`/validation/issues/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
