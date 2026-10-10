import type {
  FieldKey,
  FieldStatus,
  LandRecord,
  LandRecordHistory,
  MutationInfo,
  Provenance,
  RecordField,
  RecordStatus,
} from "../types";
import { getParcelById, MOCK_PARCELS } from "./parcels";
import { seededRandom } from "./random";

const SAMPLE_PROVENANCE: Provenance = {
  kind: "mock-sample",
  label: "Sample data (mock mode)",
  note: "Values were produced by a simulated extraction pipeline, not real OCR.",
};

export const RECORD_STATUS_LABELS: Record<RecordStatus, string> = {
  draft: "Draft",
  pending_validation: "Pending validation",
  pending_verification: "Pending verification",
  verified: "Verified",
  needs_review: "Needs review",
  rejected: "Rejected",
};

interface RecordSeed {
  id: string;
  documentId: string;
  district: string;
  mandal: string;
  village: string;
  surveyNumber: string;
  subdivisionNumber: string | null;
  landholder: string;
  areaHa: number;
  classification: string;
  recordDate: string | null;
  status: RecordStatus;
  confidence: number;
  updatedAt: string;
  mutation: MutationInfo;
}

const MUTATION_PRESENT = (number: string, date: string | null, details: string): MutationInfo => ({
  mutationNumber: number,
  mutationDate: date,
  details,
});

const MUTATION_ABSENT: MutationInfo = {
  mutationNumber: null,
  mutationDate: null,
  details: null,
};

const SEEDS: RecordSeed[] = [
  {
    id: "REC-1041",
    documentId: "DOC-2026-0141",
    district: "Guntur",
    mandal: "Amaravati",
    village: "Velagapudi",
    surveyNumber: "101",
    subdivisionNumber: "1",
    landholder: "R. Venkateswara Rao",
    areaHa: 2.412,
    classification: "Agricultural — wet land",
    recordDate: "1982-06-14",
    status: "verified",
    confidence: 0.93,
    updatedAt: "2026-10-08T12:40:00+05:30",
    mutation: MUTATION_PRESENT("MUT-1991-2214", "1991-03-08", "Partition among legal heirs; area unchanged."),
  },
  {
    id: "REC-1042",
    documentId: "DOC-2026-0141",
    district: "Guntur",
    mandal: "Amaravati",
    village: "Velagapudi",
    surveyNumber: "101",
    subdivisionNumber: "2",
    landholder: "K. Sridevi",
    areaHa: 1.876,
    classification: "Agricultural — wet land",
    recordDate: "1982-06-14",
    status: "verified",
    confidence: 0.89,
    updatedAt: "2026-10-08T12:36:00+05:30",
    mutation: MUTATION_PRESENT("MUT-1998-0771", "1998-11-22", "Sale transaction recorded; patta transferred."),
  },
  {
    id: "REC-1043",
    documentId: "DOC-2026-0141",
    district: "Guntur",
    mandal: "Amaravati",
    village: "Dondapadu",
    surveyNumber: "44",
    subdivisionNumber: null,
    landholder: "M. Mohan Reddy",
    areaHa: 3.05,
    classification: "Agricultural — dry land",
    recordDate: "1979-01-27",
    status: "pending_verification",
    confidence: 0.78,
    updatedAt: "2026-10-08T11:05:00+05:30",
    mutation: MUTATION_ABSENT,
  },
  {
    id: "REC-1044",
    documentId: "DOC-2026-0141",
    district: "Guntur",
    mandal: "Amaravati",
    village: "Dondapadu",
    surveyNumber: "45",
    subdivisionNumber: null,
    landholder: "P. Anand Prasad",
    areaHa: 1.442,
    classification: "Agricultural — dry land",
    recordDate: null,
    status: "pending_verification",
    confidence: 0.71,
    updatedAt: "2026-10-08T11:02:00+05:30",
    mutation: MUTATION_ABSENT,
  },
  {
    id: "REC-1045",
    documentId: "DOC-2026-0140",
    district: "Guntur",
    mandal: "Amaravati",
    village: "Dondapadu",
    surveyNumber: "46",
    subdivisionNumber: null,
    landholder: "T. Lakshmi Kumari",
    areaHa: 0.918,
    classification: "Residential",
    recordDate: "2003-09-02",
    status: "needs_review",
    confidence: 0.62,
    updatedAt: "2026-10-08T09:58:00+05:30",
    mutation: MUTATION_PRESENT("MUT-2003-4410", "2003-09-02", "Conversion from agricultural to residential (details partially legible)."),
  },
  {
    id: "REC-1046",
    documentId: "DOC-2026-0140",
    district: "Guntur",
    mandal: "Amaravati",
    village: "Dondapadu",
    surveyNumber: "61",
    subdivisionNumber: null,
    landholder: "G. Ramesh Naidu",
    areaHa: 2.011,
    classification: "Agricultural — plantation",
    recordDate: "1996-04-19",
    status: "pending_validation",
    confidence: 0.69,
    updatedAt: "2026-10-08T09:54:00+05:30",
    mutation: MUTATION_ABSENT,
  },
  {
    id: "REC-1047",
    documentId: "DOC-2026-0139",
    district: "Guntur",
    mandal: "Thullur",
    village: "Pinnapuram",
    surveyNumber: "88",
    subdivisionNumber: null,
    landholder: "S. Bhavana Sharma",
    areaHa: 1.764,
    classification: "Agricultural — wet land",
    recordDate: "1988-12-05",
    status: "verified",
    confidence: 0.96,
    updatedAt: "2026-10-07T16:22:00+05:30",
    mutation: MUTATION_PRESENT("MUT-2011-1188", "2011-07-30", "Gift deed in favour of daughter; recorded in mutation register."),
  },
  {
    id: "REC-1048",
    documentId: "DOC-2026-0138",
    district: "Krishna",
    mandal: "Gudivada",
    village: "Bollapuram",
    surveyNumber: "201",
    subdivisionNumber: null,
    landholder: "A. Suresh Goud",
    areaHa: 4.27,
    classification: "Agricultural — wet land",
    recordDate: "1976-08-11",
    status: "pending_verification",
    confidence: 0.74,
    updatedAt: "2026-10-07T12:50:00+05:30",
    mutation: MUTATION_PRESENT("MUT-1995-3390", "1995-02-17", "Consolidation of holding; new survey subdivision created."),
  },
  {
    id: "REC-1049",
    documentId: "DOC-2026-0138",
    district: "Krishna",
    mandal: "Gudivada",
    village: "Bollapuram",
    surveyNumber: "202",
    subdivisionNumber: null,
    landholder: "K. Prakash Rao",
    areaHa: 0.42,
    classification: "Government wasteland",
    recordDate: "1976-08-11",
    status: "rejected",
    confidence: 0.55,
    updatedAt: "2026-10-07T12:44:00+05:30",
    mutation: MUTATION_ABSENT,
  },
  {
    id: "REC-1050",
    documentId: "DOC-2026-0137",
    district: "Prakasam",
    mandal: "Ongole",
    village: "Tangutur",
    surveyNumber: "27",
    subdivisionNumber: null,
    landholder: "M. Kavitha Devi",
    areaHa: 1.12,
    classification: "Agricultural — dry land",
    recordDate: "1992-10-30",
    status: "needs_review",
    confidence: 0.58,
    updatedAt: "2026-10-06T17:15:00+05:30",
    mutation: MUTATION_PRESENT("MUT-1992-0662", null, "Entry continues on the next page; scan is truncated (simulated)."),
  },
  {
    id: "REC-1051",
    documentId: "DOC-2026-0137",
    district: "Prakasam",
    mandal: "Ongole",
    village: "Tangutur",
    surveyNumber: "28",
    subdivisionNumber: null,
    landholder: "S. Nagaraju",
    areaHa: 2.66,
    classification: "Agricultural — dry land",
    recordDate: "1992-10-30",
    status: "draft",
    confidence: 0.66,
    updatedAt: "2026-10-06T17:12:00+05:30",
    mutation: MUTATION_ABSENT,
  },
  {
    id: "REC-1052",
    documentId: "DOC-2026-0132",
    district: "Prakasam",
    mandal: "Ongole",
    village: "Chennapalem",
    surveyNumber: "110",
    subdivisionNumber: null,
    landholder: "P. Ramesh Babu",
    areaHa: 0.742,
    classification: "Residential",
    recordDate: "2004-05-21",
    status: "pending_validation",
    confidence: 0.81,
    updatedAt: "2026-10-09T09:40:00+05:30",
    mutation: MUTATION_PRESENT("MUT-2004-5127", "2004-05-21", "Site allotment recorded."),
  },
  {
    id: "REC-1053",
    documentId: "DOC-2026-0130",
    district: "East Godavari",
    mandal: "Peddapuram",
    village: "Kesavaram",
    surveyNumber: "68",
    subdivisionNumber: null,
    landholder: "G. Venkata Ramana",
    areaHa: 3.388,
    classification: "Agricultural — wet land",
    recordDate: "1985-02-09",
    status: "pending_verification",
    confidence: 0.77,
    updatedAt: "2026-10-04T14:30:00+05:30",
    mutation: MUTATION_ABSENT,
  },
  {
    id: "REC-1054",
    documentId: "DOC-2026-0130",
    district: "East Godavari",
    mandal: "Peddapuram",
    village: "Kesavaram",
    surveyNumber: "69",
    subdivisionNumber: null,
    landholder: "B. Anitha Rani",
    areaHa: 1.55,
    classification: "Agricultural — wet land",
    recordDate: "1985-02-09",
    status: "verified",
    confidence: 0.9,
    updatedAt: "2026-10-04T14:26:00+05:30",
    mutation: MUTATION_PRESENT("MUT-2007-2245", "2007-06-13", "Succession recorded after inheritance proceedings."),
  },
  {
    id: "REC-1055",
    documentId: "DOC-2026-0129",
    district: "Kurnool",
    mandal: "Kurnool",
    village: "Gadivemula",
    surveyNumber: "10",
    subdivisionNumber: null,
    landholder: "T. Suresh Kumar",
    areaHa: 2.24,
    classification: "Agricultural — dry land",
    recordDate: "1994-07-18",
    status: "verified",
    confidence: 0.97,
    updatedAt: "2026-10-03T10:15:00+05:30",
    mutation: MUTATION_PRESENT("MUT-1994-1876", "1994-07-18", "Purchase recorded; no area change."),
  },
  {
    id: "REC-1056",
    documentId: "DOC-2026-0127",
    district: "Sri Potti Sriramulu Nellore",
    mandal: "Kavali",
    village: "Vinnamala",
    surveyNumber: "82",
    subdivisionNumber: null,
    landholder: "A. Mohana Krishna",
    areaHa: 1.987,
    classification: "Agricultural — plantation",
    recordDate: "1990-11-03",
    status: "verified",
    confidence: 0.87,
    updatedAt: "2026-10-01T12:20:00+05:30",
    mutation: MUTATION_ABSENT,
  },
  {
    id: "REC-1057",
    documentId: "DOC-2026-0127",
    district: "Sri Potti Sriramulu Nellore",
    mandal: "Kavali",
    village: "Vinnamala",
    surveyNumber: "83",
    subdivisionNumber: null,
    landholder: "D. Harika",
    areaHa: 0.63,
    classification: "Residential",
    recordDate: "1990-11-03",
    status: "pending_verification",
    confidence: 0.73,
    updatedAt: "2026-10-01T12:18:00+05:30",
    mutation: MUTATION_ABSENT,
  },
  {
    id: "REC-1058",
    documentId: "DOC-2026-0126",
    district: "Kurnool",
    mandal: "Adoni",
    village: "Mantralayam",
    surveyNumber: "15",
    subdivisionNumber: null,
    landholder: "N. Basavaraj",
    areaHa: 5.12,
    classification: "Agricultural — dry land",
    recordDate: "1974-04-26",
    status: "needs_review",
    confidence: 0.61,
    updatedAt: "2026-09-30T17:02:00+05:30",
    mutation: MUTATION_PRESENT("MUT-1974-0098", null, "Historic entry; date column illegible in the sample scan (simulated)."),
  },
];

const FIELD_LABELS: Record<FieldKey, string> = {
  landholderName: "Landholder name",
  surveyNumber: "Survey number",
  subdivisionNumber: "Subdivision number",
  village: "Village",
  mandal: "Mandal",
  district: "District",
  recordedArea: "Recorded area",
  landClassification: "Land classification",
  recordDate: "Record date",
  mutationDetails: "Mutation information",
};

const FIELD_ORDER: FieldKey[] = [
  "landholderName",
  "surveyNumber",
  "subdivisionNumber",
  "village",
  "mandal",
  "district",
  "recordedArea",
  "landClassification",
  "recordDate",
  "mutationDetails",
];

function fieldStatusFor(status: RecordStatus, confidence: number, key: FieldKey): FieldStatus {
  if (status === "verified") return "accepted";
  if (status === "rejected") return "flagged";
  if (status === "needs_review") {
    const weakField = confidence < 0.65 && (key === "recordedArea" || key === "mutationDetails");
    return weakField ? "flagged" : "pending";
  }
  return "pending";
}

function fieldValue(seed: RecordSeed, key: FieldKey): { value: string; unit: string | null; page: number | null } {
  switch (key) {
    case "landholderName":
      return { value: seed.landholder, unit: null, page: 2 };
    case "surveyNumber":
      return { value: seed.surveyNumber, unit: null, page: 1 };
    case "subdivisionNumber":
      return { value: seed.subdivisionNumber ?? "—", unit: null, page: 1 };
    case "village":
      return { value: seed.village, unit: null, page: 1 };
    case "mandal":
      return { value: seed.mandal, unit: null, page: 1 };
    case "district":
      return { value: seed.district, unit: null, page: 1 };
    case "recordedArea":
      return { value: seed.areaHa.toFixed(3), unit: "ha", page: 3 };
    case "landClassification":
      return { value: seed.classification, unit: null, page: 3 };
    case "recordDate":
      return { value: seed.recordDate ?? "—", unit: null, page: 4 };
    case "mutationDetails": {
      if (!seed.mutation.mutationNumber) {
        return { value: "—", unit: null, page: null };
      }
      const parts = [seed.mutation.mutationNumber];
      if (seed.mutation.mutationDate) parts.push(seed.mutation.mutationDate);
      if (seed.mutation.details) parts.push(seed.mutation.details);
      return { value: parts.join(" · "), unit: null, page: 5 };
    }
  }
}

function fieldConfidence(seed: RecordSeed, key: FieldKey, index: number): number {
  const random = seededRandom(`${seed.id}:${key}`);
  const base = seed.confidence;
  const penalty =
    key === "mutationDetails" || key === "recordDate"
      ? 0.12
      : key === "recordedArea"
        ? 0.06
        : 0;
  const jitter = (random() - 0.5) * 0.12;
  const value = Math.max(0.31, Math.min(0.995, base - penalty + jitter - index * 0.001));
  return Number(value.toFixed(3));
}

function buildFields(seed: RecordSeed): RecordField[] {
  return FIELD_ORDER.map((key, index) => {
    const { value, unit, page } = fieldValue(seed, key);
    const confidence =
      value === "—" ? null : fieldConfidence(seed, key, index);
    const source =
      page === null
        ? "No source segment located (simulated extraction)"
        : `Page ${page}, line ${6 + index * 3} — simulated OCR`;
    return {
      key,
      label: FIELD_LABELS[key],
      value,
      unit,
      confidence,
      source,
      status: fieldStatusFor(seed.status, seed.confidence, key),
      page,
    };
  });
}

function buildHistory(seed: RecordSeed): LandRecordHistory[] {
  const history: LandRecordHistory[] = [
    {
      id: `${seed.id}-H1`,
      recordId: seed.id,
      event: "Record extracted",
      actor: "Extraction pipeline (simulated)",
      timestamp: seed.updatedAt,
      detail: `${seed.documentId} produced a draft record with aggregate confidence ${Math.round(seed.confidence * 100)}%.`,
    },
  ];
  if (seed.status !== "draft" && seed.status !== "pending_validation") {
    history.push({
      id: `${seed.id}-H2`,
      recordId: seed.id,
      event: "Automated validation run",
      actor: "Validation rules engine (simulated)",
      timestamp: seed.updatedAt,
      detail: "Format, confidence and cross-reference checks executed.",
    });
  }
  if (seed.status === "verified" || seed.status === "rejected") {
    history.push({
      id: `${seed.id}-H3`,
      recordId: seed.id,
      event: seed.status === "verified" ? "Record verified" : "Record rejected",
      actor: "Review desk (sample)",
      timestamp: seed.updatedAt,
      detail:
        seed.status === "verified"
          ? "All fields accepted by the reviewer in mock mode."
          : "Reviewer rejected the extraction; record requires re-processing.",
    });
  }
  return history;
}

export const MOCK_RECORDS: LandRecord[] = SEEDS.map((seed) => ({
    id: seed.id,
    documentId: seed.documentId,
    surveyNumber: seed.surveyNumber,
    subdivisionNumber: seed.subdivisionNumber,
    village: seed.village,
    mandal: seed.mandal,
    district: seed.district,
    state: "Andhra Pradesh",
    landholder: seed.landholder,
    recordedAreaValue: seed.areaHa,
    recordedAreaUnit: "hectares",
    landClassification: seed.classification,
    recordDate: seed.recordDate,
    mutation: seed.mutation,
    status: seed.status,
    confidence: seed.confidence,
    updatedAt: seed.updatedAt,
    fields: buildFields(seed),
    parcelId: null,
    openIssueCount: 0,
    history: buildHistory(seed),
    provenance: SAMPLE_PROVENANCE,
  }));

/** Link records to demonstration parcels where the survey identifiers match. */
export function linkRecordsToParcels(): void {
  for (const record of MOCK_RECORDS) {
    const parcel = MOCK_PARCELS.find(
      (candidate) =>
        candidate.district === record.district &&
        candidate.mandal === record.mandal &&
        candidate.village === record.village &&
        candidate.surveyNumber === record.surveyNumber &&
        (candidate.subdivisionNumber ?? null) === (record.subdivisionNumber ?? null),
    );
    if (parcel) {
      record.parcelId = parcel.id;
      parcel.recordId = record.id;
      parcel.attributes["Record link"] = record.id;
      parcel.attributes["Landholder (sample)"] = record.landholder;
    }
  }
}

linkRecordsToParcels();

export function getRecord(id: string): LandRecord | undefined {
  return MOCK_RECORDS.find((record) => record.id === id);
}

export function getRecordsByDocument(documentId: string): LandRecord[] {
  return MOCK_RECORDS.filter((record) => record.documentId === documentId);
}

export function getParcelForRecord(record: LandRecord) {
  return record.parcelId ? getParcelById(record.parcelId) : undefined;
}
