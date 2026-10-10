"use client";

import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlClassName } from "./form";

export function Toolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>
  );
}

export function ToolbarSearch({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(controlClassName, "pl-9 pr-8")}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-3 hover:text-ink"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

export function ResultCount({
  shown,
  total,
  noun,
  className,
}: {
  shown: number;
  total: number;
  noun: string;
  className?: string;
}) {
  return (
    <p className={cn("text-xs text-ink-3", className)}>
      Showing <span className="font-medium text-ink-2">{shown}</span> of{" "}
      <span className="font-medium text-ink-2">{total}</span> {noun}
      {shown === total ? "" : " (filtered)"}
    </p>
  );
}
