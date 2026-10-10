import type { AnalyticsData, CountBySeverity, CountByStatus } from "@/lib/types";
import { RECORD_STATUS_LABELS } from "@/lib/mock/records";
import { SEVERITY_LABELS } from "@/lib/mock/issues";
import { cn, formatNumber } from "@/lib/utils";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-ink-3",
  pending_validation: "bg-info",
  pending_verification: "bg-warning",
  verified: "bg-success",
  needs_review: "bg-brand-600",
  rejected: "bg-danger",
};

const SEVERITY_TONE: Record<string, string> = {
  error: "bg-danger",
  warning: "bg-warning",
  info: "bg-info",
};

export function TrendBars({ trend }: { trend: AnalyticsData["trend"] }) {
  const maxValue = Math.max(
    1,
    ...trend.map((point) => Math.max(point.processed, point.verified)),
  );
  const chartHeight = 120;

  return (
    <div>
      <div className="flex items-end gap-4" style={{ height: chartHeight }}>
        {trend.map((point) => (
          <div
            key={point.date}
            className="group flex h-full flex-1 items-end justify-center gap-0.5"
            title={`${point.date}: ${point.processed} processed, ${point.verified} verified`}
          >
            <span
              className="w-1/2 max-w-3 rounded-t-sm bg-brand-600/85 transition-colors group-hover:bg-brand-700"
              style={{ height: `${(point.processed / maxValue) * 100}%` }}
            />
            <span
              className="w-1/2 max-w-3 rounded-t-sm bg-success/80 transition-colors group-hover:bg-success"
              style={{ height: `${(point.verified / maxValue) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between border-t border-line pt-1.5 text-[10px] text-ink-3">
        <span>{trend[0]?.date}</span>
        <span>{trend[Math.floor(trend.length / 2)]?.date}</span>
        <span>{trend[trend.length - 1]?.date}</span>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-ink-2">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-brand-600/85" aria-hidden /> Processed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-success/80" aria-hidden /> Verified
        </span>
      </div>
    </div>
  );
}

function DistributionRows({
  rows,
  toneFor,
  labelFor,
  activeLabel,
}: {
  rows: Array<{ label: string; key: string; count: number }>;
  toneFor: (key: string) => string;
  labelFor: (key: string) => string;
  activeLabel?: (key: string) => string;
}) {
  const total = Math.max(
    1,
    rows.reduce((sum, row) => sum + row.count, 0),
  );

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.key}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
            <span className="truncate text-ink-2">{labelFor(row.key)}</span>
            <span className="tabular-nums text-ink">
              {formatNumber(row.count)}
              <span className="ml-1 text-ink-3">
                ({formatNumber((row.count / total) * 100, 0)}%)
              </span>
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className={cn("h-full rounded-full", toneFor(row.key))}
              style={{ width: `${(row.count / total) * 100}%` }}
            />
          </div>
          {activeLabel ? (
            <p className="mt-0.5 text-[10px] text-ink-3">{activeLabel(row.key)}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function StatusDistribution({ rows }: { rows: CountByStatus[] }) {
  return (
    <DistributionRows
      rows={rows.map((row) => ({
        key: row.status,
        label: RECORD_STATUS_LABELS[row.status] ?? row.status,
        count: row.count,
      }))}
      toneFor={(key) => STATUS_TONE[key as keyof typeof STATUS_TONE] ?? "bg-ink-3"}
      labelFor={(key) => RECORD_STATUS_LABELS[key as keyof typeof RECORD_STATUS_LABELS] ?? key}
    />
  );
}

export function SeverityDistribution({ rows }: { rows: CountBySeverity[] }) {
  return (
    <DistributionRows
      rows={rows.map((row) => ({
        key: row.severity,
        label: SEVERITY_LABELS[row.severity] ?? row.severity,
        count: row.count,
      }))}
      toneFor={(key) => SEVERITY_TONE[key as keyof typeof SEVERITY_TONE] ?? "bg-ink-3"}
      labelFor={(key) => SEVERITY_LABELS[key as keyof typeof SEVERITY_LABELS] ?? key}
    />
  );
}

export function ConfidenceDistribution({
  buckets,
}: {
  buckets: AnalyticsData["confidenceBuckets"];
}) {
  const total = Math.max(
    1,
    buckets.reduce((sum, bucket) => sum + bucket.count, 0),
  );

  return (
    <div>
      <div className="flex h-24 items-end gap-2">
        {buckets.map((bucket) => (
          <div key={bucket.label} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] tabular-nums text-ink-2">
              {bucket.count}
            </span>
            <div
              className={cn(
                "w-full rounded-t-sm",
                bucket.min < 0.7 ? "bg-warning/80" : "bg-brand-600/85",
              )}
              style={{
                height: `${Math.max(4, (bucket.count / total) * 72)}px`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-2 border-t border-line pt-1">
        {buckets.map((bucket) => (
          <span
            key={bucket.label}
            className="flex-1 text-center text-[10px] text-ink-3"
          >
            {bucket.label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-3">
        Extraction confidence per record; values below 0.70 are flagged for review.
      </p>
    </div>
  );
}
