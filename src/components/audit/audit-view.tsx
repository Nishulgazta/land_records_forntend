"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { matchesAuditFilters, type AuditFilters } from "@/lib/api/audit";
import type { AuditEvent, AuditEventType, Severity } from "@/lib/types";
import { SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { SampleNote, EmptyState } from "@/components/ui/states";
import { Table, TBody, TD, TH, THead, TR, TableFooter } from "@/components/ui/table";
import { ResultCount, Toolbar, ToolbarSearch } from "@/components/ui/toolbar";
import { formatDateTime, titleCase } from "@/lib/utils";

const PAGE_SIZE = 25;

type SeverityFilter = Severity | "all";
type TypeFilter = AuditEventType | "all";

function sortByTimestampDesc(events: AuditEvent[]): AuditEvent[] {
  return [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function AuditView({ events }: { events: AuditEvent[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [actor, setActor] = useState<string>("all");
  const [page, setPage] = useState(1);

  const typeOptions = useMemo(
    () =>
      [...new Set(events.map((event) => event.type))].sort((a, b) => a.localeCompare(b)),
    [events],
  );

  const actorOptions = useMemo(
    () => [...new Set(events.map((event) => event.actor))].sort((a, b) => a.localeCompare(b)),
    [events],
  );

  const filtered = useMemo(() => {
    const filters: AuditFilters = { query, type, severity };
    const matches = events.filter(
      (event) => matchesAuditFilters(event, filters) && (actor === "all" || event.actor === actor),
    );
    return sortByTimestampDesc(matches);
  }, [events, query, type, severity, actor]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function updateQuery(value: string): void {
    setQuery(value);
    setPage(1);
  }

  function updateType(value: string): void {
    setType(value as TypeFilter);
    setPage(1);
  }

  function updateSeverity(value: string): void {
    setSeverity(value as SeverityFilter);
    setPage(1);
  }

  function updateActor(value: string): void {
    setActor(value);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit log"
        description="Every recorded action in chronological order, newest first."
      />

      <SampleNote>
        The events below come from the bundled sample dataset that ships with this frontend. They
        demonstrate the audit trail format and are not a record of real user activity.
      </SampleNote>

      <div className="space-y-3">
        <Toolbar>
          <ToolbarSearch
            value={query}
            onChange={updateQuery}
            placeholder="Search actor, detail or related record…"
          />
          <div className="w-full sm:w-52">
            <Select
              value={type}
              onChange={(event) => updateType(event.target.value)}
              aria-label="Filter by event type"
            >
              <option value="all">All event types</option>
              {typeOptions.map((entry) => (
                <option key={entry} value={entry}>
                  {titleCase(entry)}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full sm:w-40">
            <Select
              value={severity}
              onChange={(event) => updateSeverity(event.target.value)}
              aria-label="Filter by severity"
            >
              <option value="all">All severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={actor}
              onChange={(event) => updateActor(event.target.value)}
              aria-label="Filter by actor"
            >
              <option value="all">All actors</option>
              {actorOptions.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </Select>
          </div>
        </Toolbar>

        <ResultCount shown={filtered.length} total={events.length} noun="events" />

        {filtered.length === 0 ? (
          <EmptyState
            icon={<History className="size-6" aria-hidden />}
            title="No audit events match"
            description="Try clearing the search box or widening the type, severity and actor filters."
          />
        ) : (
          <CardTable
            events={pageItems}
            page={currentPage}
            totalPages={totalPages}
            total={filtered.length}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

function CardTable({
  events,
  page,
  totalPages,
  total,
  onPageChange,
}: {
  events: AuditEvent[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <Table>
        <THead>
          <TR>
            <TH>Timestamp</TH>
            <TH>Type</TH>
            <TH>Actor</TH>
            <TH>Related</TH>
            <TH>Severity</TH>
            <TH>Detail</TH>
          </TR>
        </THead>
        <TBody>
          {events.map((event) => (
            <TR key={event.id}>
              <TD className="whitespace-nowrap text-xs tabular-nums">
                {formatDateTime(event.timestamp)}
              </TD>
              <TD className="whitespace-nowrap font-medium text-ink">{titleCase(event.type)}</TD>
              <TD className="whitespace-nowrap">{event.actor}</TD>
              <TD className="whitespace-nowrap">{event.relatedLabel}</TD>
              <TD>
                <SeverityBadge severity={event.severity} />
              </TD>
              <TD className="min-w-64 text-ink-2">{event.detail}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
      <TableFooter>
        <span>
          Page {page} of {totalPages} — {total} matching event{total === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-3.5" aria-hidden />
            Previous
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
            <ChevronRight className="size-3.5" aria-hidden />
          </Button>
        </span>
      </TableFooter>
    </div>
  );
}
