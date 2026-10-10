import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  href,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger" | "info";
  href?: string;
  className?: string;
}) {
  const toneClasses: Record<string, string> = {
    neutral: "bg-surface-3 text-ink-2",
    brand: "bg-brand-50 text-brand-700",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    info: "bg-info-soft text-info",
  };

  const body = (
    <CardContent className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-3">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink tabular-nums">
          {value}
        </p>
        {hint ? <p className="mt-1 text-xs text-ink-3">{hint}</p> : null}
      </div>
      {Icon ? (
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md",
            toneClasses[tone],
          )}
        >
          <Icon className="size-4.5" aria-hidden />
        </span>
      ) : null}
    </CardContent>
  );

  if (href) {
    return (
      <Card>
        <Link
          href={href}
          className="block transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600"
          aria-label={`${label}: ${typeof value === "string" ? value : ""} — open details`}
        >
          {body}
        </Link>
      </Card>
    );
  }

  return <Card>{body}</Card>;
}
