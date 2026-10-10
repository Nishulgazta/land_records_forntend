import type { FieldStatus, IssueStatus, Severity } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export const AREA_UNIT_LABELS: Record<string, string> = {
  hectares: "ha",
  acres: "acres",
  square_meters: "m²",
};

export function formatArea(value: number, unit: string): string {
  return `${formatNumber(value, 3)} ${AREA_UNIT_LABELS[unit] ?? unit}`;
}

export const FIELD_STATUS_LABELS: Record<FieldStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  corrected: "Corrected",
  flagged: "Flagged",
};

export const FIELD_STATUS_TONES: Record<
  FieldStatus,
  "neutral" | "success" | "info" | "danger"
> = {
  pending: "neutral",
  accepted: "success",
  corrected: "info",
  flagged: "danger",
};

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  open: "Open",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
};

export const SEVERITY_ORDER: Severity[] = ["error", "warning", "info"];

export const SIMULATED_SESSION_NOTE =
  "Issue status changes are stored in memory for this session only and are not persisted.";
