export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[];

export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) {
    if (!value && value !== 0) continue;
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      out.push(String(value));
    }
  }
  return out.join(" ");
}

const INTL_LOCALE = "en-IN";

export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(INTL_LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${formatNumber(value, value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const minutes = Math.round(abs / 60000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (minutes < 1) return rtf.format(Math.round(diffMs / 1000), "second");
  if (minutes < 60) return rtf.format(Math.round(diffMs / 60000), "minute");
  const hours = Math.round(abs / 3600000);
  if (hours < 24) return rtf.format(Math.round(diffMs / 3600000), "hour");
  const days = Math.round(abs / 86400000);
  if (days < 30) return rtf.format(Math.round(diffMs / 86400000), "day");
  const months = Math.round(abs / (86400000 * 30));
  if (months < 12) return rtf.format(Math.round(diffMs / (86400000 * 30)), "month");
  return rtf.format(Math.round(diffMs / (86400000 * 365)), "year");
}

export function formatPercent(ratio: number, fractionDigits = 0): string {
  const safe = Number.isFinite(ratio) ? ratio : 0;
  return `${formatNumber(safe * 100, fractionDigits)}%`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}
