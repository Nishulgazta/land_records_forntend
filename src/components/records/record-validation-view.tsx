"use client";

import Link from "next/link";
import type {
  LandDocument,
  LandRecord,
  ValidationIssue,
} from "@/lib/types";
import { IS_MOCK_MODE } from "@/lib/api/client";
import { SEVERITY_LABELS } from "@/lib/mock/issues";
import {
  Badge,
  CategoryBadge,
  RecordStatusBadge,
  SeverityBadge,
} from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfidenceValue } from "@/components/ui/confidence";
import { DescriptionItem, DescriptionList } from "@/components/ui/description-list";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, SampleNote } from "@/components/ui/states";
import { TD, TH, THead, TR, TBody, Table } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { IssueStatusActions } from "./issue-status-actions";
import {
  FIELD_STATUS_LABELS,
  FIELD_STATUS_TONES,
  ISSUE_STATUS_LABELS,
  SEVERITY_ORDER,
  SIMULATED_SESSION_NOTE,
} from "./helpers";

export function RecordValidationView({
  record,
  issues,
  document,
}: {
  record: LandRecord;
  issues: ValidationIssue[];
  document: LandDocument | null;
}) {
  const groups = SEVERITY_ORDER.map((severity) => ({
    severity,
    items: issues
      .filter((issue) => issue.severity === severity)
      .sort((a, b) => a.status.localeCompare(b.status)),
  })).filter((group) => group.items.length > 0);

  const openCount = issues.filter((issue) => issue.status === "open").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title={record.id}
        description={`Validation issues and field reference for ${record.landholder} in ${record.village}.`}
        parent={{ label: "Validation", href: "/validation" }}
        actions={
          <>
            <ButtonLink href={`/records/${record.id}`} variant="secondary">
              View record
            </ButtonLink>
            <ButtonLink href={`/verification/${record.id}`} variant="secondary">
              Open verification
            </ButtonLink>
          </>
        }
      />

      <SampleNote>
        {IS_MOCK_MODE
          ? "Mock mode — this record and its issues are generated sample data. "
          : ""}
        {SIMULATED_SESSION_NOTE} Every acknowledge, resolve and reopen action here is
        simulated and only changes the state held in this browser session.
      </SampleNote>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Record summary</CardTitle>
            <CardDescription>
              {openCount} open issue{openCount === 1 ? "" : "s"} of {issues.length} total.
            </CardDescription>
          </div>
          <RecordStatusBadge status={record.status} />
        </CardHeader>
        <CardContent className="space-y-3">
          <DescriptionList columns={3}>
            <DescriptionItem term="Survey number">
              {record.surveyNumber}
              {record.subdivisionNumber ? `/${record.subdivisionNumber}` : ""}
            </DescriptionItem>
            <DescriptionItem term="Village">
              {record.village}
              <span className="block text-xs text-ink-3">{record.mandal}</span>
            </DescriptionItem>
            <DescriptionItem term="Landholder">{record.landholder}</DescriptionItem>
            <DescriptionItem term="Confidence">
              <ConfidenceValue confidence={record.confidence} />
            </DescriptionItem>
          </DescriptionList>
          <div className="flex flex-wrap items-center gap-4 border-t border-line pt-3 text-sm">
            <Link
              href={`/records/${record.id}`}
              className="font-medium text-brand-700 hover:underline underline-offset-4"
            >
              Open full record
            </Link>
            <Link
              href={`/verification/${record.id}`}
              className="font-medium text-brand-700 hover:underline underline-offset-4"
            >
              Open verification workspace
            </Link>
            <Link
              href={`/documents/${record.documentId}`}
              className="font-medium text-brand-700 hover:underline underline-offset-4"
            >
              {document ? document.title : record.documentId}
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Issues by severity</h2>
            <p className="mt-0.5 text-sm text-ink-3">
              Actions are simulated session state and are not persisted.
            </p>
          </div>
        </div>

        {groups.length === 0 ? (
          <EmptyState
            title="No validation issues"
            description="This record has no issues in any severity group."
          />
        ) : (
          groups.map((group) => (
            <Card key={group.severity}>
              <CardHeader>
                <div>
                  <CardTitle>
                    {SEVERITY_LABELS[group.severity]} ({group.items.length})
                  </CardTitle>
                  <CardDescription>
                    {group.severity === "error"
                      ? "Blocking problems that must be corrected."
                      : group.severity === "warning"
                        ? "Values that need a reviewer decision."
                        : "Informational checks worth knowing about."}
                  </CardDescription>
                </div>
                <SeverityBadge severity={group.severity} />
              </CardHeader>
              <CardContent className="space-y-3">
                {group.items.map((issue) => (
                  <div
                    key={issue.id}
                    className="rounded-md border border-line bg-surface-2 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-ink">
                            {issue.fieldLabel}
                          </span>
                          <CategoryBadge category={issue.category} />
                          <Badge tone="neutral">{ISSUE_STATUS_LABELS[issue.status]}</Badge>
                          <span className="text-[11px] text-ink-3">{issue.id}</span>
                        </div>
                        <p className="text-sm text-ink-2">{issue.message}</p>
                        <p className="text-xs text-ink-3">
                          <span className="font-medium text-ink-2">Suggested:</span>{" "}
                          {issue.suggestedAction}
                        </p>
                        <p className="text-[11px] text-ink-3">
                          {issue.source} · {formatDate(issue.createdAt)}
                        </p>
                      </div>
                      <IssueStatusActions issue={issue} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Field reference</CardTitle>
            <CardDescription>
              Extracted values for this record, with confidence and source segment.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <THead>
              <TR>
                <TH>Field</TH>
                <TH>Value</TH>
                <TH>Confidence</TH>
                <TH>Source</TH>
                <TH>Page</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {record.fields.map((field) => (
                <TR key={field.key}>
                  <TD className="whitespace-nowrap font-medium text-ink">{field.label}</TD>
                  <TD>
                    {field.value}
                    {field.unit ? (
                      <span className="ml-1 text-xs text-ink-3">{field.unit}</span>
                    ) : null}
                  </TD>
                  <TD>
                    <ConfidenceValue confidence={field.confidence} />
                  </TD>
                  <TD className="max-w-xs text-xs text-ink-3">{field.source}</TD>
                  <TD className="tabular-nums">{field.page === null ? "—" : field.page}</TD>
                  <TD>
                    <Badge tone={FIELD_STATUS_TONES[field.status]}>
                      {FIELD_STATUS_LABELS[field.status]}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
