import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ConfidenceLevel = "high" | "medium" | "low" | "unknown";

export function confidenceLevel(confidence: number | null | undefined): ConfidenceLevel {
  if (confidence === null || confidence === undefined) return "unknown";
  if (confidence >= 0.85) return "high";
  if (confidence >= 0.7) return "medium";
  return "low";
}

const LEVEL_TEXT: Record<ConfidenceLevel, string> = {
  high: "text-success",
  medium: "text-warning",
  low: "text-danger",
  unknown: "text-ink-3",
};

const LEVEL_BAR: Record<ConfidenceLevel, string> = {
  high: "bg-success",
  medium: "bg-warning",
  low: "bg-danger",
  unknown: "bg-ink-3",
};

export function ConfidenceMeter({
  confidence,
  label = "Extraction confidence",
  className,
  showValue = true,
}: {
  confidence: number | null;
  label?: string;
  className?: string;
  showValue?: boolean;
}) {
  const level = confidenceLevel(confidence);
  const percent = confidence === null ? 0 : Math.round(confidence * 100);

  return (
    <div className={className}>
      {label ? (
        <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
          <span className="text-ink-3">{label}</span>
          {showValue ? (
            <span className={cn("font-medium tabular-nums", LEVEL_TEXT[level])}>
              {confidence === null ? "—" : percent}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className={cn("h-full rounded-full", LEVEL_BAR[level])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function ConfidenceValue({
  confidence,
  className,
}: {
  confidence: number | null;
  className?: string;
}) {
  const level = confidenceLevel(confidence);
  return (
    <span className={cn("font-medium tabular-nums", LEVEL_TEXT[level], className)}>
      {confidence === null ? "—" : `${Math.round(confidence * 100)}%`}
    </span>
  );
}

export function ConfidenceLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 text-[11px] text-ink-3", className)}>
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-success" aria-hidden /> ≥ 85% high
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-warning" aria-hidden /> 70–84% review
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-danger" aria-hidden /> &lt; 70% low
      </span>
    </div>
  );
}

export function FieldValue({
  value,
  unit,
  children,
}: {
  value: string;
  unit?: string | null;
  children?: ReactNode;
}) {
  return (
    <span className="text-ink">
      {value}
      {unit ? <span className="ml-1 text-xs text-ink-3">{unit}</span> : null}
      {children}
    </span>
  );
}
