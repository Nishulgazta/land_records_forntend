"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LandDocument, ProcessingJob, ProcessingStage } from "@/lib/types";
import { IS_MOCK_MODE } from "@/lib/api/client";
import { STAGE_LABELS } from "@/lib/mock/documents";
import { StageBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SampleNote } from "@/components/ui/states";
import { StatCard } from "@/components/ui/stat-card";
import { TD, TH, THead, TR, TBody, Table } from "@/components/ui/table";
import { ResultCount, Toolbar, ToolbarSearch } from "@/components/ui/toolbar";
import { ProgressBar } from "@/components/ui/states";
import { Select } from "@/components/ui/form";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { EmptyState } from "@/components/ui/states";

const STAGES: ProcessingStage[] = [
  "queued",
  "ocr",
  "extraction",
  "validation",
  "completed",
  "failed",
];

export function ProcessingListView({
  jobs,
  documents,
}: {
  jobs: ProcessingJob[];
  documents: LandDocument[];
}) {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<ProcessingStage | "all">("all");

  const docMap = useMemo(
    () => new Map(documents.map((doc) => [doc.id, doc])),
    [documents],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (stage !== "all" && job.stage !== stage) return false;
      if (!needle) return true;
      const doc = docMap.get(job.documentId);
      const haystack = [
        job.id,
        job.documentId,
        doc?.title ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [jobs, query, stage, docMap]);

  const countByStage = (value: ProcessingStage) =>
    jobs.filter((job) => job.stage === value).length;

  const queued = countByStage("queued");
  const running = countByStage("ocr") + countByStage("extraction") + countByStage("validation");
  const completed = countByStage("completed");
  const failed = countByStage("failed");

  return (
    <div className="space-y-5">
      {IS_MOCK_MODE ? (
        <SampleNote>
          Mock mode — processing jobs shown here are simulated for demonstration.
        </SampleNote>
      ) : null}
      <PageHeader
        title="Processing"
        description="Queue and status of document processing jobs."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Queued"
          value={formatNumber(queued)}
          hint={`${formatNumber(queued)} waiting`}
        />
        <StatCard
          label="Running"
          value={formatNumber(running)}
          hint="OCR, extraction or validation"
          tone="info"
        />
        <StatCard
          label="Completed"
          value={formatNumber(completed)}
          hint={`${formatNumber(completed)} done`}
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
          placeholder="Search by job id, document id or title"
        />
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
        <ResultCount shown={filtered.length} total={jobs.length} noun="jobs" />
      </Toolbar>
      <div className="card overflow-hidden">
        <Table>
          <THead>
            <TR>
              <TH>Job ID</TH>
              <TH>Document</TH>
              <TH>Stage</TH>
              <TH>Progress</TH>
              <TH>Steps</TH>
              <TH>Queued</TH>
              <TH>Started</TH>
              <TH>Action</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((job) => {
              const doc = docMap.get(job.documentId);
              const doneSteps = job.steps.filter((s) => s.status === "done").length;
              return (
                <TR key={job.id}>
                  <TD className="font-medium">{job.id}</TD>
                  <TD>
                    {doc ? (
                      <Link
                        href={`/documents/${doc.id}`}
                        className="text-ink hover:text-brand-700 hover:underline underline-offset-4"
                      >
                        {doc.title}
                      </Link>
                    ) : (
                      <span className="text-ink-3">{job.documentId}</span>
                    )}
                  </TD>
                  <TD>
                    <StageBadge stage={job.stage} />
                  </TD>
                  <TD className="min-w-44">
                    <div className="space-y-1">
                      <ProgressBar value={job.progress} />
                      <span className="text-xs text-ink-3 tabular-nums">{job.progress}%</span>
                    </div>
                  </TD>
                  <TD className="whitespace-nowrap tabular-nums">
                    {doneSteps}/{job.steps.length}
                  </TD>
                  <TD className="whitespace-nowrap text-sm">
                    {formatDateTime(job.queuedAt)}
                  </TD>
                  <TD className="whitespace-nowrap text-sm">
                    {job.startedAt ? formatDateTime(job.startedAt) : "—"}
                  </TD>
                  <TD>
                    <ButtonLink href={`/processing/${job.id}`} variant="ghost" size="sm">
                      View
                    </ButtonLink>
                  </TD>
                </TR>
              );
            })}
            {filtered.length === 0 && (
              <TR>
                <TD colSpan={8}>
                  <EmptyState
                    title="No processing jobs found"
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
