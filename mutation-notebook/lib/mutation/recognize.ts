import type { FieldKey, RecognitionResult } from "./schema";

/* ====================================================================
 *  HANDWRITING RECOGNITION SERVICE
 * ====================================================================
 *
 *  ┌──────────────────────────────────────────────────────────────────┐
 *  │  CURRENT STATUS: DEMO FALLBACK                                  │
 *  │                                                                  │
 *  │  The demo provider returns plausible *fictional* data for        │
 *  │  demonstration purposes.  It does NOT perform real handwriting   │
 *  │  recognition on the submitted image.                             │
 *  │                                                                  │
 *  │  Every response from the demo provider is clearly marked with    │
 *  │  isDemo: true  and  provider: "demo-fallback".                   │
 *  └──────────────────────────────────────────────────────────────────┘
 *
 *  TO CONNECT A REAL RECOGNITION SERVICE:
 *
 *  1. Google Cloud Vision API
 *     ─────────────────────────
 *     - Create a Google Cloud project & enable the Vision API.
 *     - Obtain an API key or service-account JSON.
 *     - Set GOOGLE_VISION_API_KEY=<your-key> in .env.local
 *     - The module will automatically use it when detected.
 *     - Google Vision supports DOCUMENT_TEXT_DETECTION with good
 *       Hindi / Devanagari accuracy.
 *
 *  2. Azure AI Document Intelligence
 *     ──────────────────────────────────
 *     - Set AZURE_DI_ENDPOINT and AZURE_DI_KEY in .env.local
 *
 *  3. Custom OCR / HTR endpoint
 *     ──────────────────────────
 *     - Implement the RecognitionProvider interface below.
 *     - Register it in the `providers` map.
 *
 * =================================================================== */

// ─── Provider interface ──────────────────────────────────────────────

interface RecognitionProvider {
  name: string;
  recognize(imageBase64: string): Promise<RecognitionResult>;
}

// ─── Demo fallback provider ──────────────────────────────────────────

const DEMO_SAMPLES: Array<
  Record<FieldKey, { value: string; confidence: number }>
> = [
  {
    entryNo: { value: "45", confidence: 0.92 },
    village: { value: "रामपुर", confidence: 0.85 },
    tehsil: { value: "सदर", confidence: 0.88 },
    district: { value: "प्रयागराज", confidence: 0.91 },
    dateOfEntry: { value: "12/03/2024", confidence: 0.78 },
    previousHolder: { value: "श्री राम प्रसाद", confidence: 0.72 },
    newHolder: { value: "श्री सुरेश कुमार", confidence: 0.75 },
    khasraNo: { value: "145/2", confidence: 0.82 },
    khataNo: { value: "23", confidence: 0.89 },
    landArea: { value: "2.5", confidence: 0.77 },
    landUnit: { value: "बीघा (Bigha)", confidence: 0.83 },
    mutationReason: { value: "विक्रय (Sale)", confidence: 0.8 },
    documentRef: {
      value: "पंजीकृत विलेख 2024/1234",
      confidence: 0.65,
    },
    remarks: { value: "", confidence: 0 },
  },
  {
    entryNo: { value: "46", confidence: 0.94 },
    village: { value: "देवली", confidence: 0.87 },
    tehsil: { value: "फूलपुर", confidence: 0.82 },
    district: { value: "प्रयागराज", confidence: 0.93 },
    dateOfEntry: { value: "15/04/2024", confidence: 0.81 },
    previousHolder: { value: "स्व. श्री महेश चन्द्र", confidence: 0.68 },
    newHolder: { value: "श्री अमर सिंह", confidence: 0.71 },
    khasraNo: { value: "302", confidence: 0.9 },
    khataNo: { value: "11", confidence: 0.88 },
    landArea: { value: "1.75", confidence: 0.79 },
    landUnit: { value: "हेक्टेयर (Hectare)", confidence: 0.85 },
    mutationReason: { value: "उत्तराधिकार (Inheritance)", confidence: 0.76 },
    documentRef: { value: "मृत्यु प्रमाण पत्र", confidence: 0.6 },
    remarks: {
      value: "उत्तराधिकार अधिनियम के अनुसार",
      confidence: 0.55,
    },
  },
  {
    entryNo: { value: "47", confidence: 0.91 },
    village: { value: "सुल्तानपुर", confidence: 0.84 },
    tehsil: { value: "सोरों", confidence: 0.79 },
    district: { value: "कासगंज", confidence: 0.86 },
    dateOfEntry: { value: "22/05/2024", confidence: 0.83 },
    previousHolder: { value: "श्रीमती कमला देवी", confidence: 0.7 },
    newHolder: { value: "श्री विनोद कुमार", confidence: 0.73 },
    khasraNo: { value: "78/1", confidence: 0.88 },
    khataNo: { value: "5", confidence: 0.92 },
    landArea: { value: "0.8", confidence: 0.81 },
    landUnit: { value: "एकड़ (Acre)", confidence: 0.84 },
    mutationReason: { value: "दान (Gift)", confidence: 0.77 },
    documentRef: { value: "दान विलेख 2024/567", confidence: 0.62 },
    remarks: { value: "", confidence: 0 },
  },
];

let demoIndex = 0;

const demoProvider: RecognitionProvider = {
  name: "demo-fallback",

  async recognize(_imageBase64: string): Promise<RecognitionResult> {
    // Simulate processing time (500-1500 ms)
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000));

    const sample = DEMO_SAMPLES[demoIndex % DEMO_SAMPLES.length];
    demoIndex++;

    return {
      raw:
        "⚠ DEMO MODE — This is simulated recognition output. " +
        "No real handwriting analysis was performed on the submitted image. " +
        "See lib/mutation/recognize.ts for instructions on connecting " +
        "a real OCR service (Google Vision, Azure, etc.).",
      extractedFields: sample,
      timestamp: new Date().toISOString(),
      provider: "demo-fallback",
      isDemo: true,
    };
  },
};

// ─── Google Cloud Vision provider (activated by env var) ─────────────

async function googleVisionRecognize(
  imageBase64: string
): Promise<RecognitionResult> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_VISION_API_KEY not set");

  // Strip data-URL prefix if present
  const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
            imageContext: { languageHints: ["hi", "en"] },
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Vision API error: ${err}`);
  }

  const json = await res.json();
  const fullText: string =
    json.responses?.[0]?.fullTextAnnotation?.text ?? "";

  // Basic heuristic field extraction from raw OCR text.
  // In production, replace this with a trained NER model or
  // prompt-based extraction (e.g., via an LLM).
  const extracted = parseRawText(fullText);

  return {
    raw: fullText,
    extractedFields: extracted,
    timestamp: new Date().toISOString(),
    provider: "google-vision",
    isDemo: false,
  };
}

/** Very simple heuristic parser for OCR output. */
function parseRawText(
  text: string
): Partial<Record<FieldKey, { value: string; confidence: number }>> {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const result: Partial<
    Record<FieldKey, { value: string; confidence: number }>
  > = {};

  const patterns: Array<{
    key: FieldKey;
    regex: RegExp;
    confidence: number;
  }> = [
    { key: "entryNo", regex: /(?:entry|प्रविष्टि|क्रमांक)[^\d]*(\d+)/i, confidence: 0.8 },
    { key: "village", regex: /(?:village|ग्राम|गांव)[:\s]*(.+)/i, confidence: 0.75 },
    { key: "tehsil", regex: /(?:tehsil|तहसील)[:\s]*(.+)/i, confidence: 0.75 },
    { key: "district", regex: /(?:district|जिला)[:\s]*(.+)/i, confidence: 0.75 },
    { key: "khasraNo", regex: /(?:khasra|खसरा)[^\d]*([\d/]+)/i, confidence: 0.8 },
    { key: "landArea", regex: /(?:area|क्षेत्रफल|रकबा)[^\d]*([\d.]+)/i, confidence: 0.7 },
  ];

  const fullText = lines.join(" ");
  for (const p of patterns) {
    const m = fullText.match(p.regex);
    if (m?.[1]) {
      result[p.key] = { value: m[1].trim(), confidence: p.confidence };
    }
  }

  return result;
}

const googleVisionProvider: RecognitionProvider = {
  name: "google-vision",
  recognize: googleVisionRecognize,
};

// ─── Provider selection ──────────────────────────────────────────────

function getProvider(): RecognitionProvider {
  if (process.env.GOOGLE_VISION_API_KEY) {
    return googleVisionProvider;
  }
  // Add more providers here as needed:
  // if (process.env.AZURE_DI_KEY) return azureProvider;

  return demoProvider;
}

// ─── Public API ──────────────────────────────────────────────────────

export async function recognizeHandwriting(
  imageBase64: string
): Promise<RecognitionResult> {
  const provider = getProvider();
  return provider.recognize(imageBase64);
}
