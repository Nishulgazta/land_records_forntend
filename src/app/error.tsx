"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <TriangleAlert className="size-6" aria-hidden />
      </span>
      <h1 className="text-lg font-semibold text-ink">Something went wrong</h1>
      <p className="max-w-md text-sm text-ink-3">
        An unexpected error occurred while rendering this view. Your data has not
        been changed.
      </p>
      {error.digest ? (
        <p className="text-xs text-ink-3">Reference: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex items-center gap-2 rounded-md bg-brand-700 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800"
      >
        <RefreshCw className="size-4" aria-hidden />
        Try again
      </button>
    </div>
  );
}
