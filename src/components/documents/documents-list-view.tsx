"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DocumentType, LandDocument, ProcessingStage } from "@/lib/types";
import { IS_MOCK_MODE } from "@/lib/api/client";
import { DOCUMENT_TYPE_LABELS, STAGE_LABELS } from "@/lib/mock/documents";
import { StageBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ConfidenceValue } from "@/components/ui/confidence";
import { Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { SampleNote } from "@/components/ui/states";
import { StatCard } from "@/components/ui/stat-card";
import { TD, TH, THead, TR, TBody, Table } from "@/components/ui/table";
import { ResultCount, Toolbar, ToolbarSearch } from "@/components/ui/toolbar";
import { ProgressBar } from "@/components/ui/states";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { EmptyState } from "@/components/ui/states";

const DOCUMENT_TYPES: DocumentType[] = [
  "land_register",
  "title_deed",
  "record_of_rights",
  "mutation_document",
  "cadastral_map",
  "patta_passbook",
  "other",
];

const STAGES: ProcessingStage[] = [
  "queued",
  "ocr",
  "extraction",
  "validation",
  "completed",
  "failed",
];

export function DocumentsListView({ documents }: { documents: LandDocument[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<DocumentType | "all">("all");
  const [stage, setStage] = useState<ProcessingStage | "all">("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return documents.filter((doc) => {
      if (type !== "all" && doc.type !== type) return false;
      if (stage !== "all" && doc.stage !== stage) return false;
      if (!needle) return true;
      const haystack = [
        doc.title,
        doc.fileName,
        doc.id,
        doc.archiveRef,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [documents, query, type, stage]);

  const countByStage = (value: ProcessingStage) =>
    documents.filter((doc) => doc.stage === value).length;

  const total = documents.length;
  const inProgress = countByStage("queued") + countByStage("ocr") + countByStage("extraction") + countByStage("validation");
  const completed = countByStage("completed");
  const failed = countByStage("failed");

  return (
    <div className="space-y-5">
      {IS_MOCK_MODE ? (
        <SampleNote>
          Mock mode — the documents listed here are generated sample data. Nothing on this page is an official record.
        </SampleNote>
      ) : null}

      <PageHeader
        title="Documents"
        description="Uploaded land documents and their processing status."
        actions={
          <ButtonLink href="/documents/upload" variant="primary">
            Upload document
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Total"
          value={formatNumber(total)}
          hint={`${formatNumber(total)} documents`}
        />
        <StatCard
          label="In progress"
          value={formatNumber(inProgress)}
          hint="Queued, OCR, extraction or validation"
          tone="info"
        />
        <StatCard
          label="Completed"
          value={formatNumber(completed)}
          hint={`${formatNumber(completed)} finished`}
          tone="success"
        />
        <StatCard
          label="Failed"
          value={formatNumber(failed)}
          hint={`${formatNumber(failed)} failed`}
          tone="danger"
        />
      </div>

      <Toolbar>
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search by title, filename or id"
        />
        <Select
          value={type}
          onChange={(event) => setType(event.target.value as DocumentType | "all")}
          aria-label="Filter by document type"
          className="w-auto min-w-52"
        >
          <option value="all">All document types</option>
          {DOCUMENT_TYPES.map((value) => (
            <option key={value} value={value}>
              {DOCUMENT_TYPE_LABELS[value]}
            </option>
          ))}
        </Select>
        <Select
          value={stage}
          onChange={(event) => setStage(event.target.value as ProcessingStage | "all")}
          aria-label="Filter by stage"
          className="w-auto min-w-44"
        >
          <option value="all">All stages</option>
          {STAGES.map((value) => (
            <option key={value} value={value}>
              {STAGE_LABELS[value]}
            </option>
          ))}
        </Select>
        <ResultCount shown={filtered.length} total={documents.length} noun="documents" />
      </Toolbar>

      <div className="card overflow-hidden">
        <Table>
          <THead>
            <TR>
              <TH>Document</TH>
              <TH>Type</TH>
              <TH>Stage</TH>
              <TH>Progress</TH>
              <TH>Pages</TH>
              <TH>Confidence</TH>
              <TH>Records</TH>
              <TH>Uploaded</TH>
              <TH>Open</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((doc) => (
              <TR key={doc.id}>
                <TD>
                  <Link
                    href={`/documents/${doc.id}`}
                    className="font-medium text-ink hover:text-brand-700 hover:underline underline-offset-4"
                  >
                    {doc.title}
                  </Link>
                  <span className="block text-xs text-ink-3">{doc.fileName}</span>
                </TD>
                <TD className="whitespace-nowrap">{DOCUMENT_TYPE_LABELS[doc.type]}</TD>
                <TD>
                  <StageBadge stage={doc.stage} />
                </TD>
                <TD className="min-w-44">
                  <div className="space-y-1">
                    <ProgressBar value={doc.progress} />
                    <span className="text-xs text-ink-3 tabular-nums">{doc.progress}%</span>
                  </div>
                </TD>
                <TD className="whitespace-nowrap tabular-nums">{doc.pageCount}</TD>
                <TD className="whitespace-nowrap">
                  <ConfidenceValue confidence={doc.confidence} />
                </TD>
                <TD className="whitespace-nowrap tabular-nums">
                  {doc.linkedRecordIds.length}
                </TD>
                <TD className="whitespace-nowrap text-sm">
                  {formatDateTime(doc.uploadedAt)}
                </TD>
                <TD>
                  <ButtonLink href={`/documents/${doc.id}`} variant="ghost" size="sm">
                    View
                  </ButtonLink>
                </TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR>
                <TD colSpan={9}>
                  <EmptyState
                    title="No documents found"
                    description="Try adjusting your filters or search terms."
                  />
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
