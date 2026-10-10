"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Info,
  ShieldCheck,
} from "lucide-react";
import type {
  IssueStatus,
  Severity,
  ValidationCategory,
  ValidationIssue,
} from "@/lib/types";
import { IS_MOCK_MODE } from "@/lib/api/client";
import { CATEGORY_LABELS, SEVERITY_LABELS } from "@/lib/mock/issues";
import { Badge, CategoryBadge, SeverityBadge } from "@/components/ui/badge";
import { Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { SampleNote } from "@/components/ui/states";
import { StatCard } from "@/components/ui/stat-card";
import { TD, TH, THead, TR, TBody, Table } from "@/components/ui/table";
import { ResultCount, Toolbar, ToolbarSearch } from "@/components/ui/toolbar";
import { formatDate } from "@/lib/utils";
import { IssueStatusActions } from "./issue-status-actions";
import { ISSUE_STATUS_LABELS, SIMULATED_SESSION_NOTE } from "./helpers";

const SEVERITIES: Severity[] = ["error", "warning", "info"];
const CATEGORIES: ValidationCategory[] = [
  "missing_value",
  "low_confidence",
  "format",
  "cross_reference",
  "duplicate",
  "geometry",
];
const STATUSES: IssueStatus[] = ["open", "acknowledged", "resolved"];

const STATUS_TONES: Record<IssueStatus, "danger" | "warning" | "success"> = {
  open: "danger",
  acknowledged: "warning",
  resolved: "success",
};

const SEVERITY_ICONS: Record<Severity, typeof Info> = {
  error: CircleAlert,
  warning: AlertTriangle,
  info: Info,
};

const SEVERITY_TONES: Record<Severity, "danger" | "warning" | "info"> = {
  error: "danger",
  warning: "warning",
  info: "info",
};

export function ValidationListView({ issues }: { issues: ValidationIssue[] }) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [category, setCategory] = useState<ValidationCategory | "all">("all");
  const [status, setStatus] = useState<IssueStatus | "all">("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return issues.filter((issue) => {
      if (severity !== "all" && issue.severity !== severity) return false;
      if (category !== "all" && issue.category !== category) return false;
      if (status !== "all" && issue.status !== status) return false;
      if (!needle) return true;
      const haystack = `${issue.message} ${issue.recordId} ${issue.fieldLabel}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [issues, query, severity, category, status]);

  const countByStatus = (value: IssueStatus) =>
    issues.filter((issue) => issue.status === value).length;
  const countBySeverity = (value: Severity) =>
    issues.filter((issue) => issue.severity === value).length;

  return (
    <div className="space-y-5">
      {IS_MOCK_MODE ? (
        <SampleNote>
          Mock mode — these validation issues were produced by simulated rules against
          generated sample records. {SIMULATED_SESSION_NOTE}
        </SampleNote>
      ) : (
        <SampleNote>{SIMULATED_SESSION_NOTE}</SampleNote>
      )}

      <PageHeader
        title="Validation"
        description="Automated checks raised against extracted records, grouped by severity and category."
        actions={<Link href="/records" className="text-sm font-medium text-brand-700 hover:underline underline-offset-4">Browse records</Link>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Open"
          value={countByStatus("open")}
          hint="Awaiting action"
          icon={ShieldCheck}
          tone="danger"
        />
        <StatCard
          label="Acknowledged"
          value={countByStatus("acknowledged")}
          hint="Seen, not closed"
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          label="Resolved"
          value={countByStatus("resolved")}
          hint="Closed by reviewer"
          icon={CheckCircle2}
          tone="success"
        />
        {SEVERITIES.map((value) => (
          <StatCard
            key={value}
            label={SEVERITY_LABELS[value]}
            value={countBySeverity(value)}
            hint="By severity"
            icon={SEVERITY_ICONS[value]}
            tone={SEVERITY_TONES[value]}
          />
        ))}
      </div>

      <Toolbar>
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search message, record id or field"
        />
        <Select
          value={severity}
          onChange={(event) => setSeverity(event.target.value as Severity | "all")}
          aria-label="Filter by severity"
          className="w-auto min-w-36"
        >
          <option value="all">All severities</option>
          {SEVERITIES.map((value) => (
            <option key={value} value={value}>
              {SEVERITY_LABELS[value]}
            </option>
          ))}
        </Select>
        <Select
          value={category}
          onChange={(event) => setCategory(event.target.value as ValidationCategory | "all")}
          aria-label="Filter by category"
          className="w-auto min-w-44"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {CATEGORY_LABELS[value]}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value as IssueStatus | "all")}
          aria-label="Filter by status"
          className="w-auto min-w-40"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {ISSUE_STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
        <ResultCount shown={filtered.length} total={issues.length} noun="issues" />
      </Toolbar>

      <div className="card overflow-hidden">
        <Table>
          <THead>
            <TR>
              <TH>Record</TH>
              <TH>Field</TH>
              <TH>Category</TH>
              <TH>Severity</TH>
              <TH>Message</TH>
              <TH>Suggested action</TH>
              <TH>Status</TH>
              <TH>Created</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((issue) => (
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
                  <CategoryBadge category={issue.category} />
                </TD>
                <TD>
                  <SeverityBadge severity={issue.severity} />
                </TD>
                <TD className="max-w-sm">{issue.message}</TD>
                <TD className="max-w-xs text-xs text-ink-3">{issue.suggestedAction}</TD>
                <TD>
                  <Badge tone={STATUS_TONES[issue.status]}>
                    {ISSUE_STATUS_LABELS[issue.status]}
                  </Badge>
                </TD>
                <TD className="whitespace-nowrap text-xs text-ink-3">
                  {formatDate(issue.createdAt)}
                </TD>
                <TD>
                  <IssueStatusActions issue={issue} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        {filtered.length === 0 ? (
          <div className="border-t border-line px-3 py-8 text-center text-sm text-ink-3">
            No issues match the current search and filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}
