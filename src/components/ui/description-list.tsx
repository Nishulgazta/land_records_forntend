import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DescriptionList({
  children,
  className,
  columns = 1,
}: {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-3",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </dl>
  );
}

export function DescriptionItem({
  term,
  children,
  className,
}: {
  term: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
        {term}
      </dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>
  );
}
