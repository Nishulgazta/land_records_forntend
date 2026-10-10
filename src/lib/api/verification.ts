import type {
  FieldKey,
  LandRecord,
  RecordField,
  RecordStatus,
  VerificationEvent,
} from "../types";
import { ApiError } from "../types";
import { IS_MOCK_MODE, apiFetch } from "./client";
import { getRecord as getMockRecord, MOCK_RECORDS } from "../mock/records";
import {
  getVerificationEvents as getMockEvents,
  MOCK_VERIFICATION_EVENTS,
} from "../mock/verification";

const REVIEWER = "Field Analyst (sample)";

export async function listVerificationEvents(
  recordId: string,
): Promise<VerificationEvent[]> {
  if (IS_MOCK_MODE) return getMockEvents(recordId);
  return apiFetch<VerificationEvent[]>(`/verification/${recordId}/events`);
}

function appendMockEvent(
  recordId: string,
  action: VerificationEvent["action"],
  detail: string,
  options: { fieldKey?: FieldKey | null; notes?: string | null } = {},
): VerificationEvent {
  const event: VerificationEvent = {
    id: `VEV-LOC-${(MOCK_VERIFICATION_EVENTS.length + 1).toString().padStart(4, "0")}`,
    recordId,
    actor: REVIEWER,
    action,
    fieldKey: options.fieldKey ?? null,
    detail,
    notes: options.notes ?? null,
    timestamp: new Date().toISOString(),
    simulated: true,
  };
  MOCK_VERIFICATION_EVENTS.push(event);
  return event;
}

/**
 * Apply a field decision (accept / correct / flag) to the in-memory record.
 * The change lives in local state for the session; nothing is persisted.
 */
export async function applyFieldDecision(
  recordId: string,
  fieldKey: FieldKey,
  status: RecordField["status"],
  newValue?: string,
): Promise<{ record: LandRecord; event: VerificationEvent }> {
  if (IS_MOCK_MODE) {
    const record = getMockRecord(recordId);
    if (!record) {
      throw new ApiError(`Record ${recordId} not found`, `/records/${recordId}`, 404);
    }
    const fields = record.fields.map((field) => {
      if (field.key !== fieldKey) return field;
      return {
        ...field,
        status,
        value: newValue !== undefined && newValue !== "" ? newValue : field.value,
      };
    });
    const updated: LandRecord = { ...record, fields, updatedAt: new Date().toISOString() };
    const index = MOCK_RECORDS.findIndex((candidate) => candidate.id === recordId);
    if (index >= 0) MOCK_RECORDS[index] = updated;

    const event = appendMockEvent(
      recordId,
      status === "flagged" ? "flagged" : status === "corrected" ? "field_corrected" : "field_accepted",
      `${status === "corrected" ? "Corrected" : status === "flagged" ? "Flagged" : "Accepted"} field: ${fields.find((f) => f.key === fieldKey)?.label ?? fieldKey}.`,
      { fieldKey },
    );
    return { record: updated, event };
  }

  const record = await apiFetch<LandRecord>(`/records/${recordId}/fields/${fieldKey}`, {
    method: "PATCH",
    body: JSON.stringify({ status, value: newValue }),
  });
  const events = await apiFetch<VerificationEvent[]>(`/verification/${recordId}/events`);
  return { record, event: events[events.length - 1] };
}

export async function addReviewerNote(
  recordId: string,
  notes: string,
): Promise<VerificationEvent> {
  if (IS_MOCK_MODE) {
    return appendMockEvent(recordId, "note_added", "Reviewer note added.", { notes });
  }
  return apiFetch<VerificationEvent>(`/verification/${recordId}/events`, {
    method: "POST",
    body: JSON.stringify({ action: "note_added", notes }),
  });
}

export async function decideRecord(
  recordId: string,
  status: Extract<RecordStatus, "verified" | "rejected" | "needs_review">,
  notes: string | null,
): Promise<{ record: LandRecord; event: VerificationEvent }> {
  if (IS_MOCK_MODE) {
    const record = getMockRecord(recordId);
    if (!record) {
      throw new ApiError(`Record ${recordId} not found`, `/records/${recordId}`, 404);
    }
    const updated: LandRecord = {
      ...record,
      status,
      updatedAt: new Date().toISOString(),
      history: [
        ...record.history,
        {
          id: `${recordId}-H${record.history.length + 1}`,
          recordId,
          event:
            status === "verified"
              ? "Record verified"
              : status === "rejected"
                ? "Record rejected"
                : "Sent back for further review",
          actor: REVIEWER,
          timestamp: new Date().toISOString(),
          detail: notes ?? "Decision recorded in mock mode (local state only).",
        },
      ],
    };
    const index = MOCK_RECORDS.findIndex((candidate) => candidate.id === recordId);
    if (index >= 0) MOCK_RECORDS[index] = updated;

    const event = appendMockEvent(
      recordId,
      status === "verified" ? "verified" : status === "rejected" ? "rejected" : "flagged",
      `Record marked as ${status} in mock mode.`,
      { notes },
    );
    return { record: updated, event };
  }

  const record = await apiFetch<LandRecord>(`/records/${recordId}/decision`, {
    method: "POST",
    body: JSON.stringify({ status, notes }),
  });
  const events = await apiFetch<VerificationEvent[]>(`/verification/${recordId}/events`);
  return { record, event: events[events.length - 1] };
}
