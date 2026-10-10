"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import type { LandRecord, RecordStatus } from "@/lib/types";
import { IS_MOCK_MODE } from "@/lib/api/client";
import { RECORD_STATUS_LABELS } from "@/lib/mock/records";
import { RecordStatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ConfidenceValue } from "@/components/ui/confidence";
import { Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { SampleNote } from "@/components/ui/states";
import { StatCard } from "@/components/ui/stat-card";
import { TD, TH, THead, TR, TBody, Table } from "@/components/ui/table";
import { ResultCount, Toolbar, ToolbarSearch } from "@/components/ui/toolbar";
import { formatDate, formatNumber } from "@/lib/utils";
import { formatArea } from "./helpers";

const STATUSES: RecordStatus[] = [
  "draft",
  "pending_validation",
  "pending_verification",
  "verified",
  "needs_review",
];

const STATUS_ICONS: Record<string, typeof FileText> = {
  draft: FileText,
  pending_validation: ShieldCheck,
  pending_verification: UserCheck,
  verified: CheckCircle2,
  needs_review: AlertTriangle,
};

const STATUS_TONES: Record<string, "neutral" | "info" | "warning" | "success"> = {
  draft: "neutral",
  pending_validation: "info",
  pending_verification: "warning",
  verified: "success",
  needs_review: "warning",
};

export function RecordsListView({ records }: { records: LandRecord[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RecordStatus | "all">("all");
  const [district, setDistrict] = useState("all");

  const districts = useMemo(
    () => Array.from(new Set(records.map((record) => record.district))).sort(),
    [records],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((record) => {
      if (status !== "all" && record.status !== status) return false;
      if (district !== "all" && record.district !== district) return false;
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
  }, [records, query, status, district]);

  const countByStatus = (value: RecordStatus) =>
    records.filter((record) => record.status === value).length;

  return (
    <div className="space-y-5">
      {IS_MOCK_MODE ? (
        <SampleNote>
          Mock mode — every record listed here is generated sample data produced by a
          simulated extraction pipeline. Nothing on this page is an official land record.
        </SampleNote>
      ) : null}

      <PageHeader
        title="Land records"
        description="Extracted land records with status, confidence and open validation issues."
        actions={
          <>
            <ButtonLink href="/map" variant="secondary">
              Open map
            </ButtonLink>
            <ButtonLink href="/export" variant="secondary">
              Export records
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {STATUSES.map((value) => (
          <StatCard
            key={value}
            label={RECORD_STATUS_LABELS[value]}
            value={formatNumber(countByStatus(value))}
            hint={`${formatNumber(countByStatus(value))} of ${formatNumber(records.length)}`}
            icon={STATUS_ICONS[value]}
            tone={STATUS_TONES[value]}
          />
        ))}
      </div>

      <Toolbar>
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search by survey no., landholder, village or id"
        />
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value as RecordStatus | "all")}
          aria-label="Filter by status"
          className="w-auto min-w-44"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {RECORD_STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
        <Select
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
          aria-label="Filter by district"
          className="w-auto min-w-40"
        >
          <option value="all">All districts</option>
          {districts.map((value) => (
            <option key={value} value={value}>
              {value}
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
              <TH>Survey no.</TH>
              <TH>Village / Mandal / District</TH>
              <TH>Landholder</TH>
              <TH>Recorded area</TH>
              <TH>Status</TH>
              <TH>Confidence</TH>
              <TH>Issues</TH>
              <TH>Updated</TH>
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
                </TD>
                <TD className="whitespace-nowrap tabular-nums">
                  {record.surveyNumber}
                  {record.subdivisionNumber ? `/${record.subdivisionNumber}` : ""}
                </TD>
                <TD className="whitespace-nowrap">
                  {record.village}
                  <span className="block text-xs text-ink-3">
                    {record.mandal} · {record.district}
                  </span>
                </TD>
                <TD className="whitespace-nowrap">{record.landholder}</TD>
                <TD className="whitespace-nowrap tabular-nums">
                  {formatArea(record.recordedAreaValue, record.recordedAreaUnit)}
                </TD>
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
              </TR>
            ))}
          </TBody>
        </Table>
        {filtered.length === 0 ? (
          <div className="border-t border-line px-3 py-8 text-center text-sm text-ink-3">
            No records match the current search and filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}
