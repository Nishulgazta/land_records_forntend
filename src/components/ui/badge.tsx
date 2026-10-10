import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, Info } from "lucide-react";
import type {
  ProcessingStage,
  RecordStatus,
  Severity,
  ValidationCategory,
} from "@/lib/types";
import { cn, titleCase } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "brand";

const TONES: Record<Tone, string> = {
  neutral: "bg-neutral-soft text-ink-2 border-neutral-line",
  success: "bg-success-soft text-success border-success-line",
  warning: "bg-warning-soft text-warning border-warning-line",
  danger: "bg-danger-soft text-danger border-danger-line",
  info: "bg-info-soft text-info border-info-line",
  brand: "bg-brand-50 text-brand-800 border-brand-200",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  title,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const RECORD_STATUS_TONE: Record<RecordStatus, Tone> = {
  draft: "neutral",
  pending_validation: "info",
  pending_verification: "warning",
  verified: "success",
  needs_review: "warning",
  rejected: "danger",
};

export function RecordStatusBadge({ status }: { status: RecordStatus }) {
  return (
    <Badge tone={RECORD_STATUS_TONE[status]} title={`Record status: ${titleCase(status)}`}>
      {titleCase(status)}
    </Badge>
  );
}

const STAGE_TONE: Record<ProcessingStage, Tone> = {
  queued: "neutral",
  ocr: "info",
  extraction: "info",
  validation: "warning",
  completed: "success",
  failed: "danger",
};

export function StageBadge({ stage }: { stage: ProcessingStage }) {
  return <Badge tone={STAGE_TONE[stage]}>{titleCase(stage)}</Badge>;
}

const SEVERITY_TONE: Record<Severity, Tone> = {
  info: "info",
  warning: "warning",
  error: "danger",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const Icon = severity === "error" ? CircleAlert : severity === "warning" ? AlertTriangle : Info;
  return (
    <Badge tone={SEVERITY_TONE[severity]}>
      <Icon className="size-3" aria-hidden />
      {titleCase(severity)}
    </Badge>
  );
}

export function CategoryBadge({ category }: { category: ValidationCategory }) {
  return <Badge tone="neutral">{titleCase(category)}</Badge>;
}

/** Confidence rendered as a coloured badge with a percentage. */
export function ConfidenceBadge({
  value,
  className,
}: {
  value: number | null;
  className?: string;
}) {
  if (value === null) {
    return <Badge tone="neutral" className={className}>Confidence n/a</Badge>;
  }
  const tone: Tone = value >= 0.85 ? "success" : value >= 0.7 ? "warning" : "danger";
  return (
    <Badge tone={tone} className={className} title={`Extraction confidence ${Math.round(value * 100)}%`}>
      {Math.round(value * 100)}% confidence
    </Badge>
  );
}

export function VerifiedTick({ className }: { className?: string }) {
  return <CheckCircle2 className={cn("size-4 text-success", className)} aria-hidden />;
}
