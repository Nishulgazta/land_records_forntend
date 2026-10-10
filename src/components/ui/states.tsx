import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Spinner } from "./button";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-3", className)}
      aria-hidden
    />
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line bg-surface-2 px-3 py-2.5">
        <Skeleton className="h-3.5 w-40" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-3 py-3">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="ml-auto h-3.5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card p-4">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-3 h-7 w-16" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
      <SkeletonTable rows={6} />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card flex flex-col items-center justify-center gap-2 px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? <div className="text-brand-700">{icon}</div> : null}
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-ink-3">{description}</p>
      ) : null}
      {action ? <div className="mt-2 flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2 py-10 text-sm text-ink-3", className)}
      role="status"
    >
      <Spinner className="size-4" />
      {label}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  retryHref,
  className,
}: {
  title?: string;
  description?: string;
  retryHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card flex flex-col items-center justify-center gap-2 border-danger-line bg-danger-soft px-6 py-10 text-center",
        className,
      )}
      role="alert"
    >
      <h3 className="text-sm font-semibold text-danger">{title}</h3>
      {description ? <p className="max-w-md text-sm text-ink-2">{description}</p> : null}
      {retryHref ? (
        <Link
          href={retryHref}
          className="mt-1 text-sm font-medium text-brand-700 underline underline-offset-4 hover:text-brand-800"
        >
          Try again
        </Link>
      ) : null}
    </div>
  );
}

export function ProgressBar({
  value,
  label,
  tone = "brand",
  className,
}: {
  value: number;
  label?: string;
  tone?: "brand" | "success" | "warning" | "danger";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const bar =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "danger"
          ? "bg-danger"
          : "bg-brand-600";
  return (
    <div className={cn("space-y-1", className)}>
      {label ? (
        <div className="flex items-center justify-between text-[11px] text-ink-3">
          <span>{label}</span>
          <span className="tabular-nums">{Math.round(clamped)}%</span>
        </div>
      ) : null}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-300", bar)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

/** Small inline note used to be explicit about mock/simulated data. */
export function SampleNote({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "rounded-md border border-warning-line bg-warning-soft px-3 py-2 text-xs text-warning",
        className,
      )}
    >
      {children}
    </p>
  );
}
