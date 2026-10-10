import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Search className="size-6" aria-hidden />
      </span>
      <h1 className="text-lg font-semibold text-ink">Page not found</h1>
      <p className="max-w-md text-sm text-ink-3">
        The page you are looking for does not exist in the Bhumi workspace, or the
        record you requested is not part of the sample dataset.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <Link
          href="/"
          className="rounded-md bg-brand-700 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          Back to dashboard
        </Link>
        <Link
          href="/documents"
          className="rounded-md border border-line-strong bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
        >
          Browse documents
        </Link>
      </div>
    </div>
  );
}
