import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  parent,
  actions,
  className,
}: {
  title: string;
  description?: string;
  parent?: { label: string; href: string };
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {parent ? (
          <nav aria-label="Breadcrumb" className="mb-1">
            <ol className="flex items-center gap-1 text-xs text-ink-3">
              <li>
                <Link
                  href={parent.href}
                  className="hover:text-brand-700 hover:underline underline-offset-4"
                >
                  {parent.label}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3" />
              </li>
              <li className="text-ink-2">{title}</li>
            </ol>
          </nav>
        ) : null}
        <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm text-ink-3">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
