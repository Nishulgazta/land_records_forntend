"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Flag,
  NotebookPen,
  Pencil,
  X,
} from "lucide-react";
import type {
  FieldKey,
  FieldStatus,
  LandDocument,
  LandRecord,
  RecordField,
  VerificationEvent,
  ValidationIssue,
} from "@/lib/types";
import { IS_MOCK_MODE } from "@/lib/api/client";
import {
  addReviewerNote,
  applyFieldDecision,
  decideRecord,
} from "@/lib/api/verification";
import { useToast } from "@/components/providers/toast-provider";
import { Badge, RecordStatusBadge, SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfidenceValue, FieldValue } from "@/components/ui/confidence";
import { DescriptionItem, DescriptionList } from "@/components/ui/description-list";
import { Input, Textarea } from "@/components/ui/form";
import { Dialog } from "@/components/ui/overlays";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, SampleNote } from "@/components/ui/states";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { formatDate, formatDateTime, titleCase } from "@/lib/utils";
import { FIELD_STATUS_LABELS, FIELD_STATUS_TONES, ISSUE_STATUS_LABELS } from "./helpers";

type Decision = Extract<
  LandRecord["status"],
  "verified" | "rejected" | "needs_review"
>;

const SESSION_ONLY_TEXT =
  "Decisions are stored in memory for this session only and are not persisted — this is a simulated verification workflow.";

export function VerificationWorkspaceView({
  record: initialRecord,
  issues,
  events: initialEvents,
  document,
}: {
  record: LandRecord;
  issues: ValidationIssue[];
  events: VerificationEvent[];
  document: LandDocument | null;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [pending, startTransition] = useTransition();

  const [record, setRecord] = useState<LandRecord>(initialRecord);
  const [events, setEvents] = useState<VerificationEvent[]>(initialEvents);
  const [correctingKey, setCorrectingKey] = useState<FieldKey | null>(null);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<Decision | null>(null);

  const decideField = (
    field: RecordField,
    status: FieldStatus,
    newValue?: string,
  ) => {
    startTransition(async () => {
      try {
        const result = await applyFieldDecision(record.id, field.key, status, newValue);
        setRecord(result.record);
        setEvents((current) => [result.event, ...current]);
        setCorrectingKey(null);
        pushToast({
          title: `Field ${status} (simulated)`,
          description: `${field.label} — stored in memory for this session only, not persisted.`,
          tone: "success",
        });
        router.refresh();
      } catch (error) {
        pushToast({
          title: "Field decision failed (simulated)",
          description: error instanceof Error ? error.message : "Unexpected error.",
          tone: "error",
        });
      }
    });
  };

  const submitNote = () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    startTransition(async () => {
      try {
        const event = await addReviewerNote(record.id, trimmed);
        setEvents((current) => [event, ...current]);
        setNote("");
        pushToast({
          title: "Reviewer note added (simulated)",
          description: "The note is kept in memory for this session only.",
          tone: "info",
        });
        router.refresh();
      } catch (error) {
        pushToast({
          title: "Could not add note (simulated)",
          description: error instanceof Error ? error.message : "Unexpected error.",
          tone: "error",
        });
      }
    });
  };

  const confirmDecision = () => {
    if (!decision) return;
    const chosen = decision;
    startTransition(async () => {
      try {
        const result = await decideRecord(
          record.id,
          chosen,
          note.trim() ? note.trim() : null,
        );
        setRecord(result.record);
        setEvents((current) => [result.event, ...current]);
        setDecision(null);
        setNote("");
        pushToast({
          title: `Record marked ${chosen} (simulated)`,
          description: "Decision stored in memory for this session only, not persisted.",
          tone: chosen === "rejected" ? "warning" : "success",
        });
        router.refresh();
      } catch (error) {
        pushToast({
          title: "Decision failed (simulated)",
          description: error instanceof Error ? error.message : "Unexpected error.",
          tone: "error",
        });
      }
    });
  };

  const openIssues = issues.filter((issue) => issue.status !== "resolved");

  return (
    <div className="space-y-5">
      {IS_MOCK_MODE ? (
        <SampleNote>
          Mock mode — this record, its document metadata and its issues are generated sample
          data. No real scan is bundled with the application.
        </SampleNote>
      ) : null}

      <PageHeader
        title={record.id}
        description={`Verification workspace for ${record.landholder} · ${record.village}, ${record.mandal}.`}
        parent={{ label: "Verification", href: "/verification" }}
        actions={
          <>
            <Badge tone="neutral">{titleCase(record.status)}</Badge>
            <Link
              href={`/records/${record.id}`}
              className="text-sm font-medium text-brand-700 hover:underline underline-offset-4"
            >
              View record
            </Link>
            <Link
              href={`/validation/${record.id}`}
              className="text-sm font-medium text-brand-700 hover:underline underline-offset-4"
            >
              Validation issues
            </Link>
          </>
        }
      />

      <SampleNote>{SESSION_ONLY_TEXT}</SampleNote>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <div>
              <CardTitle>Source document</CardTitle>
              <CardDescription>
                Simulated document preview — no source file is bundled
              </CardDescription>
            </div>
            <Badge tone="warning">Simulated</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {document ? (
              <>
                <div className="rounded-md border border-line-strong bg-surface-2 p-3">
                  <div className="rounded-md border border-dashed border-line-strong bg-surface px-4 py-8 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-warning">
                      Simulated document preview — no source file is bundled
                    </p>
                    <p className="mt-3 text-sm font-medium text-ink">{document.title}</p>
                    <p className="mt-1 text-xs text-ink-3">{document.fileName}</p>
                    <p className="mt-3 text-[11px] text-ink-3">
                      {titleCase(document.type)} · {document.language} · {document.pageCount}{" "}
                      pages
                    </p>
                  </div>
                </div>
                <DescriptionList columns={2}>
                  <DescriptionItem term="Document id">{document.id}</DescriptionItem>
                  <DescriptionItem term="Language">{document.language}</DescriptionItem>
                  <DescriptionItem term="Pages">{document.pageCount}</DescriptionItem>
                  <DescriptionItem term="Uploaded">{formatDate(document.uploadedAt)}</DescriptionItem>
                </DescriptionList>
                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-3">
                    Page list
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {Array.from({ length: document.pageCount }).map((_, index) => (
                      <li
                        key={index}
                        className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] tabular-nums text-ink-3"
                      >
                        Page {index + 1}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-[11px] text-ink-3">
                  Preview metadata only. The application does not contain the scanned image.
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-3">
                Document metadata for {record.documentId} could not be loaded, so no preview
                information is available.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Extracted fields review</CardTitle>
              <CardDescription>
                Accept, correct or flag each extracted value before making a decision.
              </CardDescription>
            </div>
            <RecordStatusBadge status={record.status} />
          </CardHeader>
          <CardContent className="px-0">
            <div className="px-4">
              {record.fields.map((field) => (
                <div
                  key={field.key}
                  className="flex flex-wrap items-start justify-between gap-3 border-b border-line py-3 last:border-b-0"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-ink">{field.label}</span>
                      <Badge tone={FIELD_STATUS_TONES[field.status]}>
                        {FIELD_STATUS_LABELS[field.status]}
                      </Badge>
                    </div>
                    {correctingKey === field.key ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          aria-label={`Corrected value for ${field.label}`}
                          className="max-w-xs"
                        />
                        <Button
                          size="sm"
                          disabled={pending}
                          onClick={() => decideField(field, "corrected", draft)}
                        >
                          Save correction
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCorrectingKey(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-ink-2">
                        <FieldValue value={field.value} unit={field.unit} />
                      </p>
                    )}
                    <p className="text-[11px] text-ink-3">
                      {field.source}
                      {field.page !== null ? ` · Page ${field.page}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <ConfidenceValue confidence={field.confidence} />
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pending || field.status === "accepted"}
                        onClick={() => decideField(field, "accepted")}
                      >
                        <Check className="size-3.5" aria-hidden />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pending}
                        onClick={() => {
                          setCorrectingKey(field.key);
                          setDraft(field.value);
                        }}
                      >
                        <Pencil className="size-3.5" aria-hidden />
                        Correct
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pending || field.status === "flagged"}
                        onClick={() => decideField(field, "flagged")}
                      >
                        <Flag className="size-3.5" aria-hidden />
                        Flag
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="block">
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="reviewer-note"
                  className="text-xs font-medium text-ink-2"
                >
                  Reviewer note
                </label>
                <Textarea
                  id="reviewer-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Record what you checked against the simulated preview"
                  className="mt-1.5"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pending || !note.trim()}
                  onClick={submitNote}
                >
                  <NotebookPen className="size-4" aria-hidden />
                  Add note
                </Button>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    disabled={pending}
                    onClick={() => setDecision("verified")}
                  >
                    <CheckCircle2 className="size-4" aria-hidden />
                    Mark verified
                  </Button>
                  <Button
                    variant="danger"
                    disabled={pending}
                    onClick={() => setDecision("rejected")}
                  >
                    <X className="size-4" aria-hidden />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Validation issues for this record</CardTitle>
            <CardDescription>
              {openIssues.length} unresolved of {issues.length} total.
            </CardDescription>
          </div>
          <Link
            href={`/validation/${record.id}`}
            className="text-xs font-medium text-brand-700 hover:underline underline-offset-4"
          >
            Open in validation
          </Link>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <p className="text-sm text-ink-3">No issues were raised for this record.</p>
          ) : (
            <ul className="space-y-2">
              {issues.map((issue) => (
                <li
                  key={issue.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-line bg-surface-2 px-3 py-2"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={issue.severity} />
                      <span className="text-sm font-medium text-ink">{issue.fieldLabel}</span>
                      <Badge tone="neutral">{ISSUE_STATUS_LABELS[issue.status]}</Badge>
                    </div>
                    <p className="text-xs text-ink-2">{issue.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Verification timeline</CardTitle>
            <CardDescription>Events recorded during this review session.</CardDescription>
          </div>
          <Badge tone="warning">Simulated</Badge>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState
              title="No verification events yet"
              description="Accept, correct or flag a field to start the audit trail."
            />
          ) : (
            <Timeline>
              {events.map((event, index) => (
                <TimelineItem
                  key={event.id}
                  status={
                    event.action === "verified"
                      ? "done"
                      : event.action === "rejected"
                        ? "failed"
                        : "info"
                  }
                  title={titleCase(event.action)}
                  timestamp={formatDateTime(event.timestamp)}
                  detail={event.detail}
                  isLast={index === events.length - 1}
                >
                  {event.notes ? (
                    <p className="mt-1 rounded-md border border-line bg-surface-2 px-2 py-1 text-[11px] text-ink-2">
                      {event.notes}
                    </p>
                  ) : null}
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={decision !== null}
        onClose={() => setDecision(null)}
        title={decision === "rejected" ? "Reject this record?" : "Mark this record verified?"}
        description={SESSION_ONLY_TEXT}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDecision(null)}>
              Cancel
            </Button>
            <Button
              variant={decision === "rejected" ? "danger" : "primary"}
              loading={pending}
              onClick={confirmDecision}
            >
              {decision === "rejected" ? "Confirm rejection" : "Confirm verification"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p>
            Record <span className="font-medium text-ink">{record.id}</span> will be set to{" "}
            <span className="font-medium text-ink">
              {decision ? titleCase(decision) : ""}
            </span>
            .
          </p>
          <p className="text-xs text-ink-3">
            Any reviewer note you typed above will be attached to the simulated event. Nothing
            is written to a server.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
