import type { ReactNode } from "react";
import { Check, Circle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimelineStatus = "pending" | "running" | "done" | "failed" | "info";

const DOT: Record<TimelineStatus, string> = {
  pending: "border-line-strong bg-surface text-ink-3",
  running: "border-info-line bg-info-soft text-info",
  done: "border-success-line bg-success-soft text-success",
  failed: "border-danger-line bg-danger-soft text-danger",
  info: "border-line-strong bg-surface-3 text-ink-2",
};

function TimelineIcon({ status }: { status: TimelineStatus }) {
  if (status === "done") return <Check className="size-3" aria-hidden />;
  if (status === "failed") return <X className="size-3" aria-hidden />;
  if (status === "running") return <Loader2 className="size-3 animate-spin" aria-hidden />;
  return <Circle className="size-2.5" aria-hidden />;
}

export function TimelineItem({
  status,
  title,
  timestamp,
  detail,
  isLast = false,
  children,
}: {
  status: TimelineStatus;
  title: string;
  timestamp?: string | null;
  detail?: string | null;
  isLast?: boolean;
  children?: ReactNode;
}) {
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {!isLast ? (
        <span
          className="absolute left-[11px] top-6 bottom-0 w-px bg-line"
          aria-hidden
        />
      ) : null}
      <span
        className={cn(
          "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border",
          DOT[status],
        )}
      >
        <TimelineIcon status={status} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className="text-sm font-medium text-ink">{title}</p>
          {timestamp ? (
            <span className="text-xs tabular-nums text-ink-3">{timestamp}</span>
          ) : null}
        </div>
        {detail ? <p className="mt-0.5 text-xs text-ink-2">{detail}</p> : null}
        {children}
      </div>
    </li>
  );
}

export function Timeline({ children }: { children: ReactNode }) {
  return <ol className="list-none">{children}</ol>;
}
