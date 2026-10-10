"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ListChecks, ShieldAlert, UserCheck } from "lucide-react";
import type { LandRecord, RecordStatus } from "@/lib/types";
import { IS_MOCK_MODE } from "@/lib/api/client";
import { RECORD_STATUS_LABELS } from "@/lib/mock/records";
import { RecordStatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfidenceValue } from "@/components/ui/confidence";
import { Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { SampleNote } from "@/components/ui/states";
import { StatCard } from "@/components/ui/stat-card";
import { TD, TH, THead, TR, TBody, Table } from "@/components/ui/table";
import { ResultCount, Toolbar, ToolbarSearch } from "@/components/ui/toolbar";
import { formatDate } from "@/lib/utils";
import { formatArea } from "./helpers";

const QUEUE_STATUSES: Array<Extract<RecordStatus, "pending_verification" | "needs_review">> =
  ["pending_verification", "needs_review"];

export function VerificationQueueView({ records }: { records: LandRecord[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RecordStatus | "all">("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((record) => {
      if (status !== "all" && record.status !== status) return false;
      if (!needle) return true;
      const haystack = [
        record.id,
        record.surveyNumber,
        record.subdivisionNumber ?? "",
        record.village,
        record.mandal,
        record.district,
        record.landholder,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [records, query, status]);

  const awaiting = records.filter(
    (record) => record.status === "pending_verification",
  ).length;
  const needingReview = records.filter(
    (record) => record.status === "needs_review",
  ).length;
  const withOpenIssues = records.filter((record) => record.openIssueCount > 0).length;

  return (
    <div className="space-y-5">
      {IS_MOCK_MODE ? (
        <SampleNote>
          Mock mode — the records in this queue are generated sample data. Verification
          decisions made here are simulated and stored in memory for this session only.
        </SampleNote>
      ) : null}

      <PageHeader
        title="Verification"
        description="Records waiting for a human check against the source document before they can be marked verified."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <StatCard
          label="Awaiting verification"
          value={awaiting}
          hint={RECORD_STATUS_LABELS.pending_verification}
          icon={UserCheck}
          tone="warning"
        />
        <StatCard
          label="Needs review"
          value={needingReview}
          hint={RECORD_STATUS_LABELS.needs_review}
          icon={ShieldAlert}
          tone="danger"
        />
        <StatCard
          label="With open issues"
          value={withOpenIssues}
          hint="Open validation issues"
          icon={ListChecks}
          tone="info"
        />
        <StatCard
          label="Queue size"
          value={records.length}
          hint="Records in scope"
          icon={UserCheck}
          tone="brand"
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>How verification works</CardTitle>
            <CardDescription>The four steps every queued record follows.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <li className="rounded-md border border-line bg-surface-2 p-3 text-sm text-ink-2">
              <span className="block text-xs font-semibold uppercase tracking-wide text-ink-3">
                1. Extraction
              </span>
              Fields are read from the uploaded document with a confidence score per value.
            </li>
            <li className="rounded-md border border-line bg-surface-2 p-3 text-sm text-ink-2">
              <span className="block text-xs font-semibold uppercase tracking-wide text-ink-3">
                2. Validation
              </span>
              Automated rules raise issues that a reviewer acknowledges or resolves.
            </li>
            <li className="rounded-md border border-line bg-surface-2 p-3 text-sm text-ink-2">
              <span className="block text-xs font-semibold uppercase tracking-wide text-ink-3">
                3. Verification
              </span>
              A reviewer compares each field with the simulated document preview and accepts,
              corrects or flags it.
            </li>
            <li className="rounded-md border border-line bg-surface-2 p-3 text-sm text-ink-2">
              <span className="block text-xs font-semibold uppercase tracking-wide text-ink-3">
                4. Decision
              </span>
              The record is marked verified, rejected, or sent back for further review.
            </li>
          </ol>
          <p className="mt-3 text-xs text-ink-3">
            Decisions are simulated in this session and are not persisted to any server.
          </p>
        </CardContent>
      </Card>

      <Toolbar>
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search by record id, survey no., village or landholder"
        />
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value as RecordStatus | "all")}
          aria-label="Filter by status"
          className="w-auto min-w-48"
        >
          <option value="all">All queued statuses</option>
          {QUEUE_STATUSES.map((value) => (
            <option key={value} value={value}>
              {RECORD_STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
        <ResultCount shown={filtered.length} total={records.length} noun="records" />
      </Toolbar>

      <div className="card overflow-hidden">
        <Table>
          <THead>
            <TR>
              <TH>Record</TH>
              <TH>Survey</TH>
              <TH>Village</TH>
              <TH>Landholder</TH>
              <TH>Status</TH>
              <TH>Confidence</TH>
              <TH>Issues</TH>
              <TH>Updated</TH>
              <TH>Action</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((record) => (
              <TR key={record.id}>
                <TD>
                  <Link
                    href={`/records/${record.id}`}
                    className="font-medium text-ink hover:text-brand-700 hover:underline underline-offset-4"
                  >
                    {record.id}
                  </Link>
                  <span className="block text-xs text-ink-3">
                    {formatArea(record.recordedAreaValue, record.recordedAreaUnit)}
                  </span>
                </TD>
                <TD className="whitespace-nowrap tabular-nums">
                  {record.surveyNumber}
                  {record.subdivisionNumber ? `/${record.subdivisionNumber}` : ""}
                </TD>
                <TD className="whitespace-nowrap">
                  {record.village}
                  <span className="block text-xs text-ink-3">{record.mandal}</span>
                </TD>
                <TD className="whitespace-nowrap">{record.landholder}</TD>
                <TD>
                  <RecordStatusBadge status={record.status} />
                </TD>
                <TD>
                  <ConfidenceValue confidence={record.confidence} />
                </TD>
                <TD className="tabular-nums">
                  {record.openIssueCount > 0 ? (
                    <Link
                      href={`/validation/${record.id}`}
                      className="font-medium text-danger hover:underline underline-offset-4"
                    >
                      {record.openIssueCount}
                    </Link>
                  ) : (
                    <span className="text-ink-3">0</span>
                  )}
                </TD>
                <TD className="whitespace-nowrap text-xs text-ink-3">
                  {formatDate(record.updatedAt)}
                </TD>
                <TD>
                  <ButtonLink
                    href={`/verification/${record.id}`}
                    variant="secondary"
                    size="sm"
                  >
                    Review
                  </ButtonLink>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        {filtered.length === 0 ? (
          <div className="border-t border-line px-3 py-8 text-center text-sm text-ink-3">
            No queued records match the current search and filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}
