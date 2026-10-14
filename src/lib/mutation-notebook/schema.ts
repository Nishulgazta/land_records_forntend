/* ------------------------------------------------------------------ */
/*  Mutation Schema — types, field definitions, sanitization helpers   */
/* ------------------------------------------------------------------ */

// ─── Field Value ─────────────────────────────────────────────────────
export interface FieldValue {
  value: string;
  source: "machine" | "manual";
  confidence?: number;
}

// ─── Field Keys ──────────────────────────────────────────────────────
export type FieldKey =
  | "entryNo"
  | "village"
  | "tehsil"
  | "district"
  | "dateOfEntry"
  | "previousHolder"
  | "newHolder"
  | "khasraNo"
  | "khataNo"
  | "landArea"
  | "landUnit"
  | "mutationReason"
  | "documentRef"
  | "remarks";

export type MutationFields = Record<FieldKey, FieldValue>;

// ─── Status ──────────────────────────────────────────────────────────
export type MutationStatus =
  | "draft"
  | "recognized"
  | "corrected"
  | "validated"
  | "awaiting_review";

export const STATUS_LABELS: Record<MutationStatus, string> = {
  draft: "Draft",
  recognized: "Recognized",
  corrected: "Corrected",
  validated: "Validated",
  awaiting_review: "Awaiting Review",
};

// ─── Validation Finding ──────────────────────────────────────────────
export interface Finding {
  field: string;
  message: string;
  type: "error" | "warning";
}

export interface ValidationFindings {
  errors: Finding[];
  warnings: Finding[];
}

// ─── Stroke / Page ───────────────────────────────────────────────────
export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  points: StrokePoint[];
  color: string;
  width: number;
  type: "pen" | "eraser";
}

export interface Page {
  id: string;
  imageData: string;
  strokes: Stroke[];
}

// ─── Recognition ─────────────────────────────────────────────────────
export interface RecognitionResult {
  raw: string;
  extractedFields: Partial<
    Record<FieldKey, { value: string; confidence: number }>
  >;
  timestamp: string;
  provider: string;
  isDemo: boolean;
}

// ─── Mutation (top-level record) ─────────────────────────────────────
export interface Mutation {
  id: string;
  status: MutationStatus;
  fields: MutationFields;
  pages: Page[];
  recognition: RecognitionResult | null;
  findings: ValidationFindings;
  createdAt: string;
  updatedAt: string;
}

// ─── Field Definitions ───────────────────────────────────────────────
export interface FieldDef {
  key: FieldKey;
  label: string;
  labelHi: string;
  required: boolean;
  placeholder: string;
  inputType?: "text" | "number" | "date" | "select";
  options?: string[];
}

export const FIELD_DEFS: FieldDef[] = [
  {
    key: "entryNo",
    label: "Entry Number",
    labelHi: "प्रविष्टि संख्या",
    required: true,
    placeholder: "e.g., 45",
  },
  {
    key: "village",
    label: "Village",
    labelHi: "ग्राम",
    required: true,
    placeholder: "e.g., रामपुर",
  },
  {
    key: "tehsil",
    label: "Tehsil",
    labelHi: "तहसील",
    required: true,
    placeholder: "e.g., सदर",
  },
  {
    key: "district",
    label: "District",
    labelHi: "जिला",
    required: true,
    placeholder: "e.g., प्रयागराज",
  },
  {
    key: "dateOfEntry",
    label: "Date of Entry",
    labelHi: "प्रविष्टि दिनांक",
    required: true,
    placeholder: "DD/MM/YYYY",
    inputType: "date",
  },
  {
    key: "previousHolder",
    label: "Previous Holder",
    labelHi: "पूर्व भूमिधर",
    required: true,
    placeholder: "e.g., श्री राम प्रसाद",
  },
  {
    key: "newHolder",
    label: "New Holder / Claimant",
    labelHi: "नवीन भूमिधर / दावेदार",
    required: true,
    placeholder: "e.g., श्री सुरेश कुमार",
  },
  {
    key: "khasraNo",
    label: "Khasra / Plot No.",
    labelHi: "खसरा / प्लॉट संख्या",
    required: true,
    placeholder: "e.g., 145/2",
  },
  {
    key: "khataNo",
    label: "Khata / Khatauni No.",
    labelHi: "खाता / खतौनी संख्या",
    required: false,
    placeholder: "e.g., 23",
  },
  {
    key: "landArea",
    label: "Land Area",
    labelHi: "भूमि क्षेत्रफल",
    required: true,
    placeholder: "e.g., 2.5",
    inputType: "number",
  },
  {
    key: "landUnit",
    label: "Land Unit",
    labelHi: "इकाई",
    required: true,
    placeholder: "Select unit",
    inputType: "select",
    options: [
      "बीघा (Bigha)",
      "हेक्टेयर (Hectare)",
      "एकड़ (Acre)",
      "मरला (Marla)",
      "कनाल (Kanal)",
      "वर्ग मीटर (Sq. Meter)",
    ],
  },
  {
    key: "mutationReason",
    label: "Mutation Reason",
    labelHi: "दाखिल-खारिज का कारण",
    required: true,
    placeholder: "Select reason",
    inputType: "select",
    options: [
      "विक्रय (Sale)",
      "उत्तराधिकार (Inheritance)",
      "दान (Gift)",
      "विभाजन (Partition)",
      "विनिमय (Exchange)",
      "न्यायालय आदेश (Court Order)",
      "अन्य (Other)",
    ],
  },
  {
    key: "documentRef",
    label: "Document Reference",
    labelHi: "दस्तावेज़ संदर्भ",
    required: false,
    placeholder: "e.g., Registered Deed 2024/1234",
  },
  {
    key: "remarks",
    label: "Remarks",
    labelHi: "टिप्पणी",
    required: false,
    placeholder: "Additional notes",
  },
];

export const ALL_FIELD_KEYS: FieldKey[] = FIELD_DEFS.map((d) => d.key);

// ─── Helpers ─────────────────────────────────────────────────────────

export function emptyField(
  source: "machine" | "manual" = "manual"
): FieldValue {
  return { value: "", source };
}

export function emptyFields(): MutationFields {
  const fields = {} as MutationFields;
  for (const key of ALL_FIELD_KEYS) {
    fields[key] = emptyField();
  }
  return fields;
}

/**
 * Sanitise raw field input from the API into a well-typed MutationFields
 * object. Unknown keys are dropped; missing keys get empty defaults.
 */
export function sanitizeFields(raw: unknown): MutationFields {
  const base = emptyFields();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;

  for (const key of ALL_FIELD_KEYS) {
    const val = obj[key];
    if (val && typeof val === "object") {
      const fv = val as Record<string, unknown>;
      base[key] = {
        value: typeof fv.value === "string" ? fv.value.trim() : "",
        source: fv.source === "machine" ? "machine" : "manual",
        confidence:
          typeof fv.confidence === "number" ? fv.confidence : undefined,
      };
    } else if (typeof val === "string") {
      base[key] = { value: val.trim(), source: "manual" };
    }
  }
  return base;
}

/**
 * Compute the status for a mutation based on its fields.
 *
 * When creating or updating via the main CRUD API the status is always
 * "draft".  Transitions to "recognized", "corrected", or
 * "awaiting_review" are handled by their dedicated endpoints.
 */
export function statusFor(_fields: MutationFields): MutationStatus {
  return "draft";
}
