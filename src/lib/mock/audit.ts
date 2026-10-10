import type { AuditEvent, AuditEventType, Provenance, Severity } from "../types";
import { MOCK_DOCUMENTS, DOCUMENT_TYPE_LABELS, STAGE_LABELS } from "./documents";
import { MOCK_ISSUES } from "./issues";
import { MOCK_RECORDS, RECORD_STATUS_LABELS } from "./records";

const SAMPLE_PROVENANCE: Provenance = {
  kind: "mock-sample",
  label: "Sample data (mock mode)",
  note: "Simulated audit trail — not a government audit log.",
};

const DETAIL_BY_TYPE: Record<AuditEventType, string> = {
  document_uploaded: "Document added to the processing queue (simulated upload).",
  processing_started: "OCR and extraction pipeline started (simulated).",
  processing_completed: "Extraction completed and a record draft was produced.",
  processing_failed: "Processing stopped: source pages below legibility threshold.",
  record_extracted: "Structured land record created from document fields.",
  validation_run: "Automated validation rules executed against the record.",
  issue_resolved: "Validation issue marked as resolved during review.",
  record_verified: "Record verified by the review desk in mock mode.",
  record_rejected: "Extraction rejected; re-processing recommended.",
  export_created: "Export package prepared (client-side generation).",
  export_failed: "Export could not be produced.",
  settings_changed: "Application preferences updated in local storage.",
  user_login: "Signed in to the sample workspace.",
};

const SEVERITY_BY_TYPE: Record<AuditEventType, Severity> = {
  document_uploaded: "info",
  processing_started: "info",
  processing_completed: "info",
  processing_failed: "error",
  record_extracted: "info",
  validation_run: "info",
  issue_resolved: "info",
  record_verified: "info",
  record_rejected: "warning",
  export_created: "info",
  export_failed: "warning",
  settings_changed: "info",
  user_login: "info",
};

interface DraftEvent {
  type: AuditEventType;
  actor: string;
  timestamp: string;
  relatedId: string | null;
  relatedLabel: string;
  detail?: string;
  severity?: Severity;
}

function buildEvents(): AuditEvent[] {
  const drafts: DraftEvent[] = [];

  drafts.push({
    type: "user_login",
    actor: "Field Analyst (sample)",
    timestamp: "2026-10-09T09:05:00+05:30",
    relatedId: null,
    relatedLabel: "Sample workspace",
  });

  for (const doc of MOCK_DOCUMENTS) {
    drafts.push({
      type: "document_uploaded",
      actor: doc.uploadedBy,
      timestamp: doc.uploadedAt,
      relatedId: doc.id,
      relatedLabel: doc.title,
      detail: `${DOCUMENT_TYPE_LABELS[doc.type]} added — ${doc.fileName}.`,
    });

    if (doc.stage !== "queued") {
      drafts.push({
        type: "processing_started",
        actor: "Processing worker (simulated)",
        timestamp: doc.uploadedAt,
        relatedId: doc.id,
        relatedLabel: doc.title,
        detail: `Pipeline entered stage: ${STAGE_LABELS[doc.stage]}.`,
      });
    }

    if (doc.stage === "completed") {
      drafts.push({
        type: "processing_completed",
        actor: "Processing worker (simulated)",
        timestamp: doc.uploadedAt,
        relatedId: doc.id,
        relatedLabel: doc.title,
        detail: `Extraction finished with ${Math.round((doc.confidence ?? 0) * 100)}% aggregate confidence.`,
      });
    }

    if (doc.stage === "failed" && doc.error) {
      drafts.push({
        type: "processing_failed",
        actor: "Processing worker (simulated)",
        timestamp: doc.uploadedAt,
        relatedId: doc.id,
        relatedLabel: doc.title,
        detail: doc.error,
      });
    }
  }

  for (const record of MOCK_RECORDS) {
    drafts.push({
      type: "record_extracted",
      actor: "Extraction pipeline (simulated)",
      timestamp: record.updatedAt,
      relatedId: record.id,
      relatedLabel: `${record.village} · Sy. ${record.surveyNumber}`,
    });

    drafts.push({
      type: "validation_run",
      actor: "Validation rules engine (simulated)",
      timestamp: record.updatedAt,
      relatedId: record.id,
      relatedLabel: record.id,
      detail: `Record is now ${RECORD_STATUS_LABELS[record.status].toLowerCase()}.`,
    });

    if (record.status === "verified") {
      drafts.push({
        type: "record_verified",
        actor: "Review desk (sample)",
        timestamp: record.updatedAt,
        relatedId: record.id,
        relatedLabel: `${record.village} · Sy. ${record.surveyNumber}`,
      });
    }

    if (record.status === "rejected") {
      drafts.push({
        type: "record_rejected",
        actor: "Review desk (sample)",
        timestamp: record.updatedAt,
        relatedId: record.id,
        relatedLabel: `${record.village} · Sy. ${record.surveyNumber}`,
      });
    }
  }

  for (const issue of MOCK_ISSUES) {
    if (issue.status === "resolved" || issue.status === "acknowledged") {
      drafts.push({
        type: "issue_resolved",
        actor: "Review desk (sample)",
        timestamp: issue.createdAt,
        relatedId: issue.recordId,
        relatedLabel: `${issue.fieldLabel} — ${issue.category.replace(/_/g, " ")}`,
        detail: issue.message,
        severity: issue.severity,
      });
    }
  }

  drafts.push({
    type: "settings_changed",
    actor: "Field Analyst (sample)",
    timestamp: "2026-10-09T09:10:00+05:30",
    relatedId: null,
    relatedLabel: "Display preferences",
    detail: "Table density set to comfortable (stored in local storage).",
  });

  drafts.push({
    type: "export_created",
    actor: "Field Analyst (sample)",
    timestamp: "2026-10-08T17:40:00+05:30",
    relatedId: "EXP-1002",
    relatedLabel: "GeoJSON export · 6 features",
    detail: "Client-side GeoJSON package generated from a village selection.",
  });

  const events: AuditEvent[] = drafts.map((draft, index) => ({
    id: `AUD-${String(5000 + index)}`,
    type: draft.type,
    actor: draft.actor,
    timestamp: new Date(
      new Date(draft.timestamp).getTime() + (index % 7) * 45_000,
    ).toISOString(),
    relatedId: draft.relatedId,
    relatedLabel: draft.relatedLabel,
    detail: draft.detail ?? DETAIL_BY_TYPE[draft.type],
    severity: draft.severity ?? SEVERITY_BY_TYPE[draft.type],
    provenance: SAMPLE_PROVENANCE,
  }));

  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export const MOCK_AUDIT_EVENTS: AuditEvent[] = buildEvents();

export function getAuditEventsForRecord(recordId: string): AuditEvent[] {
  return MOCK_AUDIT_EVENTS.filter((event) => event.relatedId === recordId);
}
