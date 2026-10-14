import type { Page, RecognitionResult } from "./schema";

/* ------------------------------------------------------------------ */
/*  Data-cleaning helpers for untrusted API input                      */
/* ------------------------------------------------------------------ */

/** Sanitise an array of page objects coming from the client. */
export function cleanPages(raw: unknown): Page[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((p: unknown): p is Record<string, unknown> =>
      Boolean(p && typeof p === "object")
    )
    .map((p) => ({
      id: typeof p.id === "string" ? p.id : crypto.randomUUID(),
      imageData: typeof p.imageData === "string" ? p.imageData : "",
      strokes: Array.isArray(p.strokes) ? p.strokes : [],
    }));
}

/** Sanitise a recognition-result object, or return null. */
export function cleanRecognition(raw: unknown): RecognitionResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  return {
    raw: typeof r.raw === "string" ? r.raw : "",
    extractedFields:
      r.extractedFields && typeof r.extractedFields === "object"
        ? (r.extractedFields as RecognitionResult["extractedFields"])
        : {},
    timestamp:
      typeof r.timestamp === "string"
        ? r.timestamp
        : new Date().toISOString(),
    provider: typeof r.provider === "string" ? r.provider : "unknown",
    isDemo: r.isDemo === true,
  };
}
