import type {
  LandDocument,
  ProcessingJob,
  ProcessingStep,
  Provenance,
  DocumentType,
  ProcessingStage,
} from "../types";

const SAMPLE_PROVENANCE: Provenance = {
  kind: "mock-sample",
  label: "Sample data (mock mode)",
  note: "Simulated workflow — no file has been uploaded to a server.",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  land_register: "Scanned land register",
  title_deed: "Title deed",
  record_of_rights: "Record of rights",
  mutation_document: "Mutation document",
  cadastral_map: "Cadastral map",
  patta_passbook: "Patta passbook",
  other: "Other land record",
};

export const STAGE_LABELS: Record<ProcessingStage, string> = {
  queued: "Queued",
  ocr: "OCR running",
  extraction: "Extracting fields",
  validation: "Validating",
  completed: "Completed",
  failed: "Failed",
};

interface DocSeed {
  id: string;
  title: string;
  fileName: string;
  type: DocumentType;
  stage: ProcessingStage;
  uploadedAt: string;
  uploadedBy: string;
  sizeBytes: number;
  pageCount: number;
  language: string;
  confidence: number | null;
  linkedRecordIds: string[];
  error?: string;
  archiveRef: string;
}

const SEEDS: DocSeed[] = [
  {
    id: "DOC-2026-0141",
    title: "Land register — Velagapudi, ward 3 (1978–1984)",
    fileName: "velagapudi_land_register_1978_1984.pdf",
    type: "land_register",
    stage: "completed",
    uploadedAt: "2026-10-08T09:12:00+05:30",
    uploadedBy: "K. Ramya",
    sizeBytes: 18_874_368,
    pageCount: 64,
    language: "Telugu / English",
    confidence: 0.91,
    linkedRecordIds: ["REC-1041", "REC-1042", "REC-1043", "REC-1044"],
    archiveRef: "Sample set A — village register scans",
  },
  {
    id: "DOC-2026-0140",
    title: "Patta passbook set — Dondapadu",
    fileName: "dondapadu_patta_set_scan.pdf",
    type: "patta_passbook",
    stage: "completed",
    uploadedAt: "2026-10-08T08:41:00+05:30",
    uploadedBy: "K. Ramya",
    sizeBytes: 6_291_456,
    pageCount: 18,
    language: "Telugu",
    confidence: 0.86,
    linkedRecordIds: ["REC-1045", "REC-1046"],
    archiveRef: "Sample set A — village register scans",
  },
  {
    id: "DOC-2026-0139",
    title: "Title deed — Pinnapuram, sy. 88",
    fileName: "pinnapuram_sy88_title_deed.pdf",
    type: "title_deed",
    stage: "completed",
    uploadedAt: "2026-10-07T15:05:00+05:30",
    uploadedBy: "S. Nagaraju",
    sizeBytes: 4_194_304,
    pageCount: 11,
    language: "English",
    confidence: 0.94,
    linkedRecordIds: ["REC-1047"],
    archiveRef: "Sample set B — registered deeds",
  },
  {
    id: "DOC-2026-0138",
    title: "Record of rights — Bollapuram, sy. 201",
    fileName: "bollapuram_sy201_ror.pdf",
    type: "record_of_rights",
    stage: "completed",
    uploadedAt: "2026-10-07T11:33:00+05:30",
    uploadedBy: "S. Nagaraju",
    sizeBytes: 3_145_728,
    pageCount: 9,
    language: "Telugu / English",
    confidence: 0.79,
    linkedRecordIds: ["REC-1048", "REC-1049"],
    archiveRef: "Sample set B — registered deeds",
  },
  {
    id: "DOC-2026-0137",
    title: "Mutation register extract — Tangutur",
    fileName: "tangutur_mutation_extract_1992.pdf",
    type: "mutation_document",
    stage: "completed",
    uploadedAt: "2026-10-06T16:20:00+05:30",
    uploadedBy: "A. Devika",
    sizeBytes: 2_097_152,
    pageCount: 6,
    language: "Telugu",
    confidence: 0.72,
    linkedRecordIds: ["REC-1050", "REC-1051"],
    archiveRef: "Sample set C — mutation extracts",
  },
  {
    id: "DOC-2026-0136",
    title: "Cadastral sheet index — Ongole division",
    fileName: "ongole_cadastral_index_sheet.png",
    type: "cadastral_map",
    stage: "completed",
    uploadedAt: "2026-10-06T10:02:00+05:30",
    uploadedBy: "A. Devika",
    sizeBytes: 12_582_912,
    pageCount: 1,
    language: "—",
    confidence: 0.64,
    linkedRecordIds: [],
    archiveRef: "Sample set D — map sheets",
  },
  {
    id: "DOC-2026-0135",
    title: "Land register — Kovur, volume II",
    fileName: "kovur_register_vol2_faded.pdf",
    type: "land_register",
    stage: "failed",
    uploadedAt: "2026-10-05T14:47:00+05:30",
    uploadedBy: "K. Ramya",
    sizeBytes: 25_165_824,
    pageCount: 72,
    language: "Telugu",
    confidence: null,
    linkedRecordIds: [],
    error:
      "OCR engine could not segment text: page images are below the minimum legibility threshold (simulated failure).",
    archiveRef: "Sample set A — village register scans",
  },
  {
    id: "DOC-2026-0134",
    title: "Title deed — Kodali, sy. 31",
    fileName: "kodali_sy31_deed.pdf",
    type: "title_deed",
    stage: "ocr",
    uploadedAt: "2026-10-09T09:58:00+05:30",
    uploadedBy: "S. Nagaraju",
    sizeBytes: 5_242_880,
    pageCount: 14,
    language: "English",
    confidence: null,
    linkedRecordIds: [],
    archiveRef: "Sample set B — registered deeds",
  },
  {
    id: "DOC-2026-0133",
    title: "Record of rights — Gudimula, sy. 9",
    fileName: "gudimula_sy9_ror.pdf",
    type: "record_of_rights",
    stage: "extraction",
    uploadedAt: "2026-10-09T09:44:00+05:30",
    uploadedBy: "A. Devika",
    sizeBytes: 2_621_440,
    pageCount: 8,
    language: "Telugu / English",
    confidence: null,
    linkedRecordIds: [],
    archiveRef: "Sample set B — registered deeds",
  },
  {
    id: "DOC-2026-0132",
    title: "Mutation document — Chennapalem",
    fileName: "chennapalem_mutation_2004.pdf",
    type: "mutation_document",
    stage: "validation",
    uploadedAt: "2026-10-09T09:31:00+05:30",
    uploadedBy: "K. Ramya",
    sizeBytes: 1_572_864,
    pageCount: 4,
    language: "Telugu",
    confidence: 0.81,
    linkedRecordIds: ["REC-1052"],
    archiveRef: "Sample set C — mutation extracts",
  },
  {
    id: "DOC-2026-0131",
    title: "Patta passbook — Bandapalem",
    fileName: "bandapalem_patta_passbook.pdf",
    type: "patta_passbook",
    stage: "queued",
    uploadedAt: "2026-10-09T10:12:00+05:30",
    uploadedBy: "A. Devika",
    sizeBytes: 3_670_016,
    pageCount: 12,
    language: "Telugu",
    confidence: null,
    linkedRecordIds: [],
    archiveRef: "Sample set A — village register scans",
  },
  {
    id: "DOC-2026-0130",
    title: "Land register — Kesavaram, sy. 68",
    fileName: "kesavaram_sy68_register.pdf",
    type: "land_register",
    stage: "completed",
    uploadedAt: "2026-10-04T13:18:00+05:30",
    uploadedBy: "S. Nagaraju",
    sizeBytes: 9_437_184,
    pageCount: 36,
    language: "Telugu",
    confidence: 0.68,
    linkedRecordIds: ["REC-1053", "REC-1054"],
    archiveRef: "Sample set A — village register scans",
  },
  {
    id: "DOC-2026-0129",
    title: "Title deed — Gadivemula, sy. 10",
    fileName: "gadivemula_sy10_deed.pdf",
    type: "title_deed",
    stage: "completed",
    uploadedAt: "2026-10-03T09:26:00+05:30",
    uploadedBy: "K. Ramya",
    sizeBytes: 3_355_443,
    pageCount: 10,
    language: "English",
    confidence: 0.96,
    linkedRecordIds: ["REC-1055"],
    archiveRef: "Sample set B — registered deeds",
  },
  {
    id: "DOC-2026-0128",
    title: "Cadastral sheet — Peddapuram block",
    fileName: "peddapuram_block_sheet.tif",
    type: "cadastral_map",
    stage: "completed",
    uploadedAt: "2026-10-02T15:54:00+05:30",
    uploadedBy: "A. Devika",
    sizeBytes: 31_457_280,
    pageCount: 1,
    language: "—",
    confidence: 0.58,
    linkedRecordIds: [],
    archiveRef: "Sample set D — map sheets",
  },
  {
    id: "DOC-2026-0127",
    title: "Record of rights — Vinnamala, sy. 82",
    fileName: "vinnamala_sy82_ror.pdf",
    type: "record_of_rights",
    stage: "completed",
    uploadedAt: "2026-10-01T11:47:00+05:30",
    uploadedBy: "S. Nagaraju",
    sizeBytes: 2_831_155,
    pageCount: 7,
    language: "Telugu / English",
    confidence: 0.88,
    linkedRecordIds: ["REC-1056", "REC-1057"],
    archiveRef: "Sample set B — registered deeds",
  },
  {
    id: "DOC-2026-0126",
    title: "Mutation register — Mantralayam",
    fileName: "mantralayam_mutation_register.pdf",
    type: "mutation_document",
    stage: "completed",
    uploadedAt: "2026-09-30T16:05:00+05:30",
    uploadedBy: "K. Ramya",
    sizeBytes: 5_767_168,
    pageCount: 20,
    language: "Telugu",
    confidence: 0.75,
    linkedRecordIds: ["REC-1058"],
    archiveRef: "Sample set C — mutation extracts",
  },
];

export const MOCK_DOCUMENTS: LandDocument[] = SEEDS.map((seed) => ({
  id: seed.id,
  title: seed.title,
  fileName: seed.fileName,
  type: seed.type,
  stage: seed.stage,
  progress:
    seed.stage === "completed"
      ? 100
      : seed.stage === "failed"
        ? 100
        : seed.stage === "queued"
          ? 4
          : seed.stage === "ocr"
            ? 34
            : seed.stage === "extraction"
              ? 62
              : 84,
  uploadedAt: seed.uploadedAt,
  uploadedBy: seed.uploadedBy,
  sizeBytes: seed.sizeBytes,
  pageCount: seed.pageCount,
  language: seed.language,
  confidence: seed.confidence,
  linkedRecordIds: seed.linkedRecordIds,
  error: seed.error ?? null,
  provenance: SAMPLE_PROVENANCE,
  archiveRef: seed.archiveRef,
}));

const STEP_TEMPLATES: Array<{ key: string; label: string; detail: string }> = [
  { key: "ingest", label: "Ingest document", detail: "Checksum and page count recorded" },
  { key: "preprocess", label: "Preprocess pages", detail: "Deskew, denoise, binarise (simulated)" },
  { key: "ocr", label: "OCR text recognition", detail: "Telugu + English layout model (simulated)" },
  { key: "extract", label: "Structured field extraction", detail: "Key/value pairing (simulated)" },
  { key: "validate", label: "Automated validation", detail: "Format, cross-reference and confidence rules" },
  { key: "publish", label: "Publish record draft", detail: "Queued for human verification" },
];

function buildSteps(seed: DocSeed): ProcessingStep[] {
  const stepCount = STEP_TEMPLATES.length;
  const doneCount =
    seed.stage === "completed"
      ? stepCount
      : seed.stage === "failed"
        ? 2
        : seed.stage === "queued"
          ? 0
          : seed.stage === "ocr"
            ? 2
            : seed.stage === "extraction"
              ? 3
              : 5;

  const baseTime = new Date(seed.uploadedAt).getTime();
  return STEP_TEMPLATES.map((template, index) => {
    const startedAtMs = baseTime + index * 45_000;
    const status: ProcessingStep["status"] =
      index < doneCount
        ? "done"
        : index === doneCount && seed.stage !== "queued" && seed.stage !== "completed"
          ? seed.stage === "failed"
            ? "failed"
            : "running"
          : "pending";

    return {
      key: template.key,
      label: template.label,
      status,
      startedAt:
        status === "pending" ? null : new Date(startedAtMs).toISOString(),
      completedAt:
        status === "done" || status === "failed"
          ? new Date(startedAtMs + 40_000).toISOString()
          : null,
      detail:
        status === "failed" && seed.error ? seed.error : template.detail,
    };
  });
}

export const MOCK_PROCESSING_JOBS: ProcessingJob[] = SEEDS.map((seed) => {
  const steps = buildSteps(seed);
  const runningIndex = steps.findIndex((step) => step.status === "running");
  const failedIndex = steps.findIndex((step) => step.status === "failed");
  const completedCount = steps.filter((step) => step.status === "done").length;
  const progress =
    seed.stage === "completed"
      ? 100
      : seed.stage === "failed"
        ? 33
        : Math.round(
            ((completedCount + (runningIndex >= 0 ? 0.5 : 0)) / steps.length) * 100,
          );

  const lastDone = [...steps].reverse().find((step) => step.completedAt);

  return {
    id: `JOB-${seed.id.replace("DOC-", "")}`,
    documentId: seed.id,
    stage: seed.stage,
    progress,
    queuedAt: seed.uploadedAt,
    startedAt: steps[0]?.startedAt ?? null,
    completedAt:
      seed.stage === "completed" || seed.stage === "failed"
        ? lastDone?.completedAt ?? steps[steps.length - 1]?.completedAt ?? null
        : null,
    steps:
      failedIndex >= 0
        ? steps.map((step, i) => (i > failedIndex ? { ...step, status: "pending" as const } : step))
        : steps,
    error: seed.error ?? null,
    provenance: SAMPLE_PROVENANCE,
  };
});

export function getDocument(id: string): LandDocument | undefined {
  return MOCK_DOCUMENTS.find((doc) => doc.id === id);
}

export function getJobForDocument(documentId: string): ProcessingJob | undefined {
  return MOCK_PROCESSING_JOBS.find((job) => job.documentId === documentId);
}

export function getJob(id: string): ProcessingJob | undefined {
  return MOCK_PROCESSING_JOBS.find((job) => job.id === id);
}
