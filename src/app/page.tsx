import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileText,
  ScrollText,
  Upload,
  UserCheck,
} from "lucide-react";
import {
  ConfidenceDistribution,
  SeverityDistribution,
  StatusDistribution,
  TrendBars,
} from "@/components/dashboard/charts";
import { RecordStatusBadge, SeverityBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SampleNote } from "@/components/ui/states";
import { StatCard } from "@/components/ui/stat-card";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { IS_MOCK_MODE } from "@/lib/api/client";
import {
  MOCK_AUDIT_EVENTS,
  MOCK_ISSUES,
  MOCK_RECORDS,
  RECORD_STATUS_LABELS,
  getAnalyticsData,
} from "@/lib/mock";
import { cn, formatDateTime, formatNumber, formatPercent, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

function auditTypeLabel(type: string): string {
  return titleCase(type.replace(/_/g, " "));
}

export default function DashboardPage() {
  const analytics = getAnalyticsData();
  const { summary } = analytics;

  const openIssues = MOCK_ISSUES.filter((issue) => issue.status === "open");
  const queue = MOCK_RECORDS.filter(
    (record) => record.status === "pending_verification" || record.status === "needs_review",
  ).slice(0, 6);
  const recentAudit = MOCK_AUDIT_EVENTS.slice(0, 7);

  return (
    <div className="space-y-5">
      {IS_MOCK_MODE ? (
        <SampleNote>
          Demonstration workspace — every document, record, parcel and metric below is
          generated sample data. Nothing here is an official land record.
        </SampleNote>
      ) : null}

      <PageHeader
        title="Land Operations Dashboard"
        description="Digitisation, validation and verification status across the bundled cadastral dataset."
        actions={
          <>
            <ButtonLink href="/documents/upload" variant="primary">
              <Upload className="size-4" aria-hidden />
              Upload document
            </ButtonLink>
            <ButtonLink href="/map" variant="secondary">
              Open map
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Land records"
          value={formatNumber(summary.totalRecords)}
          hint={`${formatNumber(summary.totalParcels)} demo parcels`}
          icon={ScrollText}
          href="/records"
        />
        <StatCard
          label="Verified"
          value={formatNumber(summary.verifiedRecords)}
          hint={formatPercent(summary.verifiedRecords / Math.max(1, summary.totalRecords))}
          icon={CheckCircle2}
          tone="success"
          href="/verification"
        />
        <StatCard
          label="Awaiting verification"
          value={formatNumber(summary.pendingVerification)}
          hint="In reviewer queue"
          icon={UserCheck}
          tone="warning"
          href="/verification"
        />
        <StatCard
          label="Open validation issues"
          value={formatNumber(summary.openIssues)}
          hint="Across all records"
          icon={AlertTriangle}
          tone="danger"
          href="/validation"
        />
        <StatCard
          label="Documents processed"
          value={formatNumber(summary.documentsProcessed)}
          hint={`${formatNumber(summary.documentsInQueue)} in queue`}
          icon={Cpu}
          tone="info"
          href="/processing"
        />
        <StatCard
          label="Low-confidence extractions"
          value={formatNumber(summary.lowConfidenceExtractions)}
          hint="Confidence below 0.70"
          icon={FileText}
          href="/documents"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Processing &amp; verification trend</CardTitle>
            <p className="text-xs text-ink-3">
              Last 14 days of simulated workflow activity.
            </p>
          </CardHeader>
          <CardContent>
            <TrendBars trend={analytics.trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Record status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDistribution rows={analytics.byStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Verification queue</CardTitle>
            <Link
              href="/verification"
              className="text-xs font-medium text-brand-700 hover:underline underline-offset-4"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="px-0 sm:px-0">
            <div className="overflow-x-auto scrollbar-thin">
              <Table>
                <THead>
                  <TR>
                    <TH>Record</TH>
                    <TH>Survey no.</TH>
                    <TH>Village / Mandal</TH>
                    <TH>Status</TH>
                    <TH>Confidence</TH>
                    <TH>Issues</TH>
                  </TR>
                </THead>
                <TBody>
                  {queue.map((record) => (
                    <TR key={record.id}>
                      <TD>
                        <Link
                          href={`/records/${record.id}`}
                          className="font-medium text-ink hover:text-brand-700 hover:underline underline-offset-4"
                        >
                          {record.id}
                        </Link>
                        <span className="block text-xs text-ink-3">{record.landholder}</span>
                      </TD>
                      <TD className="whitespace-nowrap tabular-nums">
                        {record.surveyNumber}
                        {record.subdivisionNumber ? `/${record.subdivisionNumber}` : ""}
                      </TD>
                      <TD className="whitespace-nowrap">
                        {record.village}
                        <span className="block text-xs text-ink-3">{record.mandal}</span>
                      </TD>
                      <TD>
                        <RecordStatusBadge status={record.status} />
                      </TD>
                      <TD
                        className={cn(
                          "tabular-nums",
                          record.confidence < 0.7 ? "text-warning" : "text-ink-2",
                        )}
                      >
                        {formatPercent(record.confidence, 0)}
                      </TD>
                      <TD className="tabular-nums">
                        {record.openIssueCount > 0 ? (
                          <Link
                            href={`/validation/${record.id}`}
                            className="text-danger hover:underline underline-offset-4"
                          >
                            {record.openIssueCount}
                          </Link>
                        ) : (
                          <span className="text-ink-3">0</span>
                        )}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation issues by severity</CardTitle>
            </CardHeader>
            <CardContent>
              <SeverityDistribution rows={analytics.issuesBySeverity} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <Link
                href="/audit"
                className="text-xs font-medium text-brand-700 hover:underline underline-offset-4"
              >
                Audit log
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAudit.map((event) => (
                <div key={event.id} className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      event.severity === "error"
                        ? "bg-danger"
                        : event.severity === "warning"
                          ? "bg-warning"
                          : "bg-ink-3",
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-ink">
                      {auditTypeLabel(event.type)} · {event.relatedLabel}
                    </p>
                    <p className="truncate text-[11px] text-ink-3">
                      {event.actor} — {formatDateTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Open validation issues</CardTitle>
            <Link
              href="/validation"
              className="text-xs font-medium text-brand-700 hover:underline underline-offset-4"
            >
              Review all
            </Link>
          </CardHeader>
          <CardContent className="px-0 sm:px-0">
            <div className="overflow-x-auto scrollbar-thin">
              <Table>
                <THead>
                  <TR>
                    <TH>Record</TH>
                    <TH>Field</TH>
                    <TH>Severity</TH>
                    <TH>Message</TH>
                    <TH>Raised</TH>
                  </TR>
                </THead>
                <TBody>
                  {openIssues.slice(0, 7).map((issue) => (
                    <TR key={issue.id}>
                      <TD>
                        <Link
                          href={`/validation/${issue.recordId}`}
                          className="font-medium text-ink hover:text-brand-700 hover:underline underline-offset-4"
                        >
                          {issue.recordId}
                        </Link>
                      </TD>
                      <TD className="whitespace-nowrap">{issue.fieldLabel}</TD>
                      <TD>
                        <SeverityBadge severity={issue.severity} />
                      </TD>
                      <TD className="max-w-md text-ink-2">{issue.message}</TD>
                      <TD className="whitespace-nowrap text-xs text-ink-3">
                        {formatDateTime(issue.createdAt)}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extraction confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <ConfidenceDistribution buckets={analytics.confidenceBuckets} />
            <div className="mt-4 border-t border-line pt-3 text-xs">
              <p className="mb-1 text-ink-3">Records by status</p>
              <p className="text-ink-2">
                {analytics.byStatus
                  .map((row) => `${RECORD_STATUS_LABELS[row.status]}: ${row.count}`)
                  .join(" · ")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
