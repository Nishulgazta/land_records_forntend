import type {
  AnalyticsData,
  ConfidenceBucket,
  DocumentType,
  RecordStatus,
} from "../types";
import { MOCK_DOCUMENTS } from "./documents";
import { MOCK_ISSUES } from "./issues";
import { MOCK_PARCELS } from "./parcels";
import { MOCK_RECORDS } from "./records";
import { seededRandom } from "./random";

const RECORD_STATUSES: RecordStatus[] = [
  "draft",
  "pending_validation",
  "pending_verification",
  "verified",
  "needs_review",
  "rejected",
];

function buildConfidenceBuckets(): ConfidenceBucket[] {
  const buckets: ConfidenceBucket[] = [
    { label: "0.30–0.49", min: 0.3, max: 0.5, count: 0 },
    { label: "0.50–0.69", min: 0.5, max: 0.7, count: 0 },
    { label: "0.70–0.84", min: 0.7, max: 0.85, count: 0 },
    { label: "0.85–1.00", min: 0.85, max: 1.01, count: 0 },
  ];
  for (const record of MOCK_RECORDS) {
    const bucket = buckets.find(
      (candidate) => record.confidence >= candidate.min && record.confidence < candidate.max,
    );
    if (bucket) bucket.count += 1;
  }
  return buckets;
}

function buildTrend(): AnalyticsData["trend"] {
  const points: AnalyticsData["trend"] = [];
  const end = new Date("2026-10-09T00:00:00+05:30");
  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date(end.getTime() - i * 86_400_000);
    const random = seededRandom(`trend:${date.toISOString().slice(0, 10)}`);
    const processed = Math.round(4 + random() * 14);
    const verified = Math.round(2 + random() * 10);
    points.push({
      date: date.toISOString().slice(0, 10),
      processed,
      verified,
    });
  }
  return points;
}

function documentsByType(): Array<{ type: DocumentType; count: number }> {
  const counts = new Map<DocumentType, number>();
  for (const doc of MOCK_DOCUMENTS) {
    counts.set(doc.type, (counts.get(doc.type) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAnalyticsData(): AnalyticsData {
  const byStatus = RECORD_STATUSES.map((status) => ({
    status,
    count: MOCK_RECORDS.filter((record) => record.status === status).length,
  }));

  const severityCounts = new Map<string, number>();
  for (const issue of MOCK_ISSUES) {
    severityCounts.set(issue.severity, (severityCounts.get(issue.severity) ?? 0) + 1);
  }

  return {
    summary: {
      totalParcels: MOCK_PARCELS.length,
      totalRecords: MOCK_RECORDS.length,
      verifiedRecords: MOCK_RECORDS.filter((record) => record.status === "verified").length,
      pendingVerification: MOCK_RECORDS.filter(
        (record) => record.status === "pending_verification",
      ).length,
      lowConfidenceExtractions: MOCK_RECORDS.filter(
        (record) => record.confidence < 0.7,
      ).length,
      documentsProcessed: MOCK_DOCUMENTS.filter((doc) => doc.stage === "completed").length,
      documentsInQueue: MOCK_DOCUMENTS.filter(
        (doc) => doc.stage !== "completed" && doc.stage !== "failed",
      ).length,
      openIssues: MOCK_ISSUES.filter((issue) => issue.status === "open").length,
    },
    byStatus,
    issuesBySeverity: (["error", "warning", "info"] as const).map((severity) => ({
      severity,
      count: severityCounts.get(severity) ?? 0,
    })),
    confidenceBuckets: buildConfidenceBuckets(),
    trend: buildTrend(),
    documentsByType: documentsByType(),
    provenance: {
      kind: "mock-sample",
      label: "Sample data (mock mode)",
      note: "All counts are computed from the bundled sample dataset.",
    },
  };
}
