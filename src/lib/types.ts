import type { FeatureCollection, Geometry } from "geojson";

/* ------------------------------------------------------------------ *
 * Data provenance
 * ------------------------------------------------------------------ */

/**
 * Every entity in this frontend carries provenance so the UI can be honest
 * about where its data came from. While the backend is not connected the
 * application runs in mock mode and all records are clearly sample data.
 */
export type ProvenanceKind =
  | "mock-sample"
  | "demonstration-geometry"
  | "user-drawn"
  | "backend";

export interface Provenance {
  kind: ProvenanceKind;
  label: string;
  note?: string;
}

/* ------------------------------------------------------------------ *
 * Documents
 * ------------------------------------------------------------------ */

export type DocumentType =
  | "land_register"
  | "title_deed"
  | "record_of_rights"
  | "mutation_document"
  | "cadastral_map"
  | "patta_passbook"
  | "other";

export type ProcessingStage =
  | "queued"
  | "ocr"
  | "extraction"
  | "validation"
  | "completed"
  | "failed";

export interface LandDocument {
  id: string;
  title: string;
  fileName: string;
  type: DocumentType;
  stage: ProcessingStage;
  /** 0–100 overall processing progress. */
  progress: number;
  uploadedAt: string;
  uploadedBy: string;
  sizeBytes: number;
  pageCount: number;
  language: string;
  /** Overall extraction confidence 0–1, null until extraction finished. */
  confidence: number | null;
  linkedRecordIds: string[];
  error: string | null;
  provenance: Provenance;
  archiveRef: string;
}

export interface ProcessingStep {
  key: string;
  label: string;
  status: "pending" | "running" | "done" | "failed";
  startedAt: string | null;
  completedAt: string | null;
  detail: string | null;
}

export interface ProcessingJob {
  id: string;
  documentId: string;
  stage: ProcessingStage;
  progress: number;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  steps: ProcessingStep[];
  error: string | null;
  provenance: Provenance;
}

/* ------------------------------------------------------------------ *
 * Extracted land records
 * ------------------------------------------------------------------ */

export type RecordStatus =
  | "draft"
  | "pending_validation"
  | "pending_verification"
  | "verified"
  | "needs_review"
  | "rejected";

export type FieldKey =
  | "landholderName"
  | "surveyNumber"
  | "subdivisionNumber"
  | "village"
  | "mandal"
  | "district"
  | "recordedArea"
  | "landClassification"
  | "recordDate"
  | "mutationDetails";

export type FieldStatus = "pending" | "accepted" | "corrected" | "flagged";

export interface RecordField {
  key: FieldKey;
  label: string;
  value: string;
  unit: string | null;
  /** 0–1 confidence reported by the (simulated) extraction step, or null. */
  confidence: number | null;
  /** Where the value came from, e.g. "Page 2, line 14 (simulated OCR)". */
  source: string;
  status: FieldStatus;
  page: number | null;
}

export interface MutationInfo {
  mutationNumber: string | null;
  mutationDate: string | null;
  details: string | null;
}

export interface LandRecord {
  id: string;
  documentId: string;
  surveyNumber: string;
  subdivisionNumber: string | null;
  village: string;
  mandal: string;
  district: string;
  state: string;
  landholder: string;
  recordedAreaValue: number;
  recordedAreaUnit: "hectares" | "acres" | "square_meters";
  landClassification: string;
  recordDate: string | null;
  mutation: MutationInfo;
  status: RecordStatus;
  /** Aggregate field confidence 0–1. */
  confidence: number;
  updatedAt: string;
  fields: RecordField[];
  parcelId: string | null;
  openIssueCount: number;
  history: LandRecordHistory[];
  provenance: Provenance;
}

export interface LandRecordHistory {
  id: string;
  recordId: string;
  event: string;
  actor: string;
  timestamp: string;
  detail: string;
}

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

export type ValidationCategory =
  | "missing_value"
  | "low_confidence"
  | "format"
  | "cross_reference"
  | "duplicate"
  | "geometry";

export type Severity = "info" | "warning" | "error";

export type IssueStatus = "open" | "acknowledged" | "resolved";

export interface ValidationIssue {
  id: string;
  recordId: string;
  fieldKey: FieldKey | null;
  fieldLabel: string;
  category: ValidationCategory;
  severity: Severity;
  confidence: number | null;
  message: string;
  source: string;
  suggestedAction: string;
  status: IssueStatus;
  createdAt: string;
  provenance: Provenance;
}

/* ------------------------------------------------------------------ *
 * Verification
 * ------------------------------------------------------------------ */

export type VerificationAction =
  | "opened"
  | "field_accepted"
  | "field_corrected"
  | "note_added"
  | "flagged"
  | "verified"
  | "rejected";

export interface VerificationEvent {
  id: string;
  recordId: string;
  actor: string;
  action: VerificationAction;
  fieldKey: FieldKey | null;
  detail: string;
  notes: string | null;
  timestamp: string;
  simulated: boolean;
}

/* ------------------------------------------------------------------ *
 * Locations (administrative hierarchy)
 * ------------------------------------------------------------------ */

export interface VillageNode {
  id: string;
  name: string;
  surveyNumbers: string[];
}

export interface MandalNode {
  id: string;
  name: string;
  villages: VillageNode[];
}

export interface DistrictNode {
  id: string;
  name: string;
  mandals: MandalNode[];
}

export interface StateNode {
  id: string;
  name: string;
  districts: DistrictNode[];
}

/* ------------------------------------------------------------------ *
 * Parcels & geometry
 * ------------------------------------------------------------------ */

export type ParcelGeometry = Geometry;

export type ParcelClassification =
  | "Agricultural — wet land"
  | "Agricultural — dry land"
  | "Agricultural — plantation"
  | "Residential"
  | "Commercial"
  | "Government wasteland"
  | "Road / utility";

export interface Parcel {
  id: string;
  surveyNumber: string;
  subdivisionNumber: string | null;
  village: string;
  mandal: string;
  district: string;
  state: string;
  areaHectares: number;
  classification: ParcelClassification;
  landholderLabel: string;
  recordId: string | null;
  geometry: ParcelGeometry;
  provenance: Provenance;
  attributes: Record<string, string | number | boolean | null>;
}

export interface ParcelCollection extends FeatureCollection {
  features: Array<{
    type: "Feature";
    id: string;
    geometry: ParcelGeometry;
    properties: Record<string, string | number | boolean | null>;
  }>;
}

/* ------------------------------------------------------------------ *
 * Audit
 * ------------------------------------------------------------------ */

export type AuditEventType =
  | "document_uploaded"
  | "processing_started"
  | "processing_completed"
  | "processing_failed"
  | "record_extracted"
  | "validation_run"
  | "issue_resolved"
  | "record_verified"
  | "record_rejected"
  | "export_created"
  | "export_failed"
  | "settings_changed"
  | "user_login";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  actor: string;
  timestamp: string;
  relatedId: string | null;
  relatedLabel: string;
  detail: string;
  severity: Severity;
  provenance: Provenance;
}

/* ------------------------------------------------------------------ *
 * Exports
 * ------------------------------------------------------------------ */

export type ExportFormat =
  | "geojson"
  | "kml"
  | "kmz"
  | "csv"
  | "dxf"
  | "png"
  | "jpg"
  | "shapefile"
  | "geopackage"
  | "pdf"
  | "dem_geotiff"
  | "xyz_points";

export type ExportExecution =
  | "client"
  | "server"
  | "unavailable";

export type ExportJobStatus =
  | "draft"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "unsupported";

export interface ExportFormatInfo {
  format: ExportFormat;
  label: string;
  extension: string;
  description: string;
  execution: ExportExecution;
  keepsAttributes: boolean;
  keepsProvenance: boolean;
}

export interface ExportOptions {
  crs: string;
  includeAttributes: boolean;
  includeProvenance: boolean;
  includeUnselected: boolean;
  scope: "selection" | "village" | "map_view";
}

export interface ExportJob {
  id: string;
  format: ExportFormat;
  status: ExportJobStatus;
  createdAt: string;
  completedAt: string | null;
  featureCount: number;
  options: ExportOptions;
  fileName: string;
  sizeBytes: number | null;
  /** Client-generated object URL when a real file was produced, else null. */
  downloadUrl: string | null;
  error: string | null;
  provenance: Provenance;
}

/* ------------------------------------------------------------------ *
 * Analytics
 * ------------------------------------------------------------------ */

export interface AnalyticsSummary {
  totalParcels: number;
  totalRecords: number;
  verifiedRecords: number;
  pendingVerification: number;
  lowConfidenceExtractions: number;
  documentsProcessed: number;
  documentsInQueue: number;
  openIssues: number;
}

export interface CountByStatus {
  status: RecordStatus;
  count: number;
}

export interface CountBySeverity {
  severity: Severity;
  count: number;
}

export interface ConfidenceBucket {
  label: string;
  min: number;
  max: number;
  count: number;
}

export interface TrendPoint {
  date: string;
  processed: number;
  verified: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  byStatus: CountByStatus[];
  issuesBySeverity: CountBySeverity[];
  confidenceBuckets: ConfidenceBucket[];
  trend: TrendPoint[];
  documentsByType: Array<{ type: DocumentType; count: number }>;
  provenance: Provenance;
}

/* ------------------------------------------------------------------ *
 * Application settings
 * ------------------------------------------------------------------ */

export type Density = "comfortable" | "compact";
export type BasemapId = "positron" | "liberty" | "satellite";

export interface AppSettings {
  profileName: string;
  profileRole: string;
  density: Density;
  showSampleBanner: boolean;
  defaultBasemap: BasemapId;
  terrainExaggeration: number;
  defaultCrs: string;
  defaultMapMode: "2d" | "3d";
}

export const DEFAULT_SETTINGS: AppSettings = {
  profileName: "Field Analyst",
  profileRole: "Validation Officer",
  density: "comfortable",
  showSampleBanner: true,
  defaultBasemap: "positron",
  terrainExaggeration: 1.4,
  defaultCrs: "EPSG:4326",
  defaultMapMode: "2d",
};

/* ------------------------------------------------------------------ *
 * API envelope
 * ------------------------------------------------------------------ */

export interface ApiResult<T> {
  data: T;
  mode: "mock" | "live";
}

export class ApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(message: string, path: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.path = path;
    this.status = status;
  }
}
