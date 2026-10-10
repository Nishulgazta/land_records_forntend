import type { VerificationEvent, VerificationAction } from "../types";
import { MOCK_RECORDS } from "./records";

/**
 * Seed audit trail for the verification workflow. New events produced while
 * interacting with the app in mock mode are kept in component state only —
 * nothing here is written back to a server.
 */

const ACTOR = "Review desk (sample)";

function iso(base: string, offsetMinutes: number): string {
  return new Date(new Date(base).getTime() + offsetMinutes * 60_000).toISOString();
}

function buildForRecord(): VerificationEvent[] {
  const events: VerificationEvent[] = [];
  let counter = 0;

  const push = (
    recordId: string,
    action: VerificationAction,
    timestamp: string,
    detail: string,
    notes: string | null = null,
    fieldKey: VerificationEvent["fieldKey"] = null,
  ) => {
    counter += 1;
    events.push({
      id: `VEV-${String(counter).padStart(4, "0")}`,
      recordId,
      actor: ACTOR,
      action,
      fieldKey,
      detail,
      notes,
      timestamp,
      simulated: true,
    });
  };

  for (const record of MOCK_RECORDS) {
    const base = record.updatedAt;
    push(record.id, "opened", iso(base, -6), `Opened record ${record.id} for review.`);

    if (record.status === "verified") {
      push(
        record.id,
        "field_accepted",
        iso(base, -3),
        "Accepted landholder name and survey identifiers.",
        null,
        "landholderName",
      );
      push(
        record.id,
        "field_accepted",
        iso(base, -2),
        "Accepted recorded area after checking the source page.",
        "Checked against page 3 of the sample scan.",
        "recordedArea",
      );
      push(
        record.id,
        "verified",
        iso(base, 0),
        "Marked record as verified in mock mode.",
        "All extracted fields reviewed against the sample document.",
      );
    } else if (record.status === "rejected") {
      push(
        record.id,
        "note_added",
        iso(base, -4),
        "Reviewer note added.",
        "Area conflicts with the surveyor block on page 3 — extraction unreliable.",
      );
      push(
        record.id,
        "flagged",
        iso(base, -2),
        "Flagged recorded area and classification for re-processing.",
        null,
        "recordedArea",
      );
      push(
        record.id,
        "rejected",
        iso(base, 0),
        "Rejected the extraction; document should be re-processed.",
        "Sample rejection — no data was persisted to a server.",
      );
    } else if (record.status === "needs_review") {
      push(
        record.id,
        "flagged",
        iso(base, -1),
        "Flagged low-confidence fields for closer review.",
        null,
        "recordedArea",
      );
    }
  }

  return events;
}

export const MOCK_VERIFICATION_EVENTS: VerificationEvent[] = buildForRecord();

export function getVerificationEvents(recordId: string): VerificationEvent[] {
  return MOCK_VERIFICATION_EVENTS.filter((event) => event.recordId === recordId).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}
