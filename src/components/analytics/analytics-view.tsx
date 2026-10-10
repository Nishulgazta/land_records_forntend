"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  FileText,
  Inbox,
  Map,
  ScrollText,
  UserCheck,
} from "lucide-react";
import {
  ConfidenceDistribution,
  SeverityDistribution,
  StatusDistribution,
  TrendBars,
} from "@/components/dashboard/charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SampleNote } from "@/components/ui/states";
import { StatCard } from "@/components/ui/stat-card";
import { DOCUMENT_TYPE_LABELS } from "@/lib/mock/documents";
import type { AnalyticsData } from "@/lib/types";
import { formatNumber, formatPercent, titleCase } from "@/lib/utils";

export function AnalyticsView({ data }: { data: AnalyticsData }) {
  const { summary } = data;
  const recordTotal = Math.max(1, summary.totalRecords);
  const verificationRate = summary.verifiedRecords / recordTotal;
  const lowConfidenceShare = summary.lowConfidenceExtractions / recordTotal;
  const openIssueDensity = summary.openIssues / recordTotal;
  const documentTotal = data.documentsByType.reduce((sum, row) => sum + row.count, 0);
  const maxDocumentCount = Math.max(1, ...data.documentsByType.map((row) => row.count));

  const insights = [
    {
      label: "Verification rate",
      value: formatPercent(verificationRate, 1),
      detail: `${formatNumber(summary.verifiedRecords)} of ${formatNumber(summary.totalRecords)} extracted records are verified.`,
    },
    {
      label: "Low-confidence share",
      value: formatPercent(lowConfidenceShare, 1),
      detail: `${formatNumber(summary.lowConfidenceExtractions)} records were extracted below 0.70 confidence.`,
    },
    {
      label: "Open-issue density",
      value: formatPercent(openIssueDensity, 1),
      detail: `${formatNumber(summary.openIssues)} open validation issues per loaded record.`,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        description="Digitisation, verification and quality signals across the bundled sample dataset."
      />

      <SampleNote>
        Every metric on this page is derived from the bundled sample dataset that ships with this
        frontend — no production telemetry is connected. Treat the numbers as demonstration data,
        not as official statistics.
      </SampleNote>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <StatCard
          label="Total parcels"
          value={formatNumber(summary.totalParcels)}
          hint="Demonstration geometry"
          icon={Map}
          tone="brand"
        />
        <StatCard
          label="Total records"
          value={formatNumber(summary.totalRecords)}
          hint="Extracted land records"
          icon={ScrollText}
        />
        <StatCard
          label="Verified"
          value={formatNumber(summary.verifiedRecords)}
          hint={formatPercent(verificationRate, 1)}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Pending verification"
          value={formatNumber(summary.pendingVerification)}
          hint="Awaiting reviewer sign-off"
          icon={UserCheck}
          tone="warning"
        />
        <StatCard
          label="Low-confidence extractions"
          value={formatNumber(summary.lowConfidenceExtractions)}
          hint="Confidence below 0.70"
          icon={FileText}
          tone="warning"
        />
        <StatCard
          label="Documents processed"
          value={formatNumber(summary.documentsProcessed)}
          hint="Completed the pipeline"
          icon={Cpu}
          tone="info"
        />
        <StatCard
          label="Documents in queue"
          value={formatNumber(summary.documentsInQueue)}
          hint="Still being processed"
          icon={Inbox}
        />
        <StatCard
          label="Open issues"
          value={formatNumber(summary.openIssues)}
          hint="Unresolved validation issues"
          icon={AlertTriangle}
          tone="danger"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Processing and verification trend</CardTitle>
              <CardDescription>Documents processed vs. records verified over 14 days.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <TrendBars trend={data.trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Records by status</CardTitle>
              <CardDescription>How extracted records are progressing.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <StatusDistribution rows={data.byStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Issues by severity</CardTitle>
              <CardDescription>Validation issues raised across the sample records.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <SeverityDistribution rows={data.issuesBySeverity} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Extraction confidence</CardTitle>
              <CardDescription>Confidence buckets for extracted fields.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ConfidenceDistribution buckets={data.confidenceBuckets} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Documents by type</CardTitle>
              <CardDescription>
                {formatNumber(documentTotal)} documents in the sample corpus.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {data.documentsByType.length === 0 ? (
              <p className="text-sm text-ink-3">No documents in the sample dataset.</p>
            ) : (
              <ul className="space-y-3">
                {data.documentsByType.map((row) => (
                  <li key={row.type}>
                    <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                      <span className="truncate text-ink-2">
                        {DOCUMENT_TYPE_LABELS[row.type] ?? titleCase(row.type)}
                      </span>
                      <span className="tabular-nums text-ink">{formatNumber(row.count)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-brand-600/85"
                        style={{ width: `${(row.count / maxDocumentCount) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Insights</CardTitle>
            <CardDescription>Quality ratios computed from the sample dataset.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-3">
            {insights.map((insight) => (
              <div key={insight.label}>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-3">
                  {insight.label}
                </dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-ink">
                  {insight.value}
                </dd>
                <p className="mt-1 text-xs text-ink-3">{insight.detail}</p>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
