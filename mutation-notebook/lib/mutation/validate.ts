import {
  type MutationFields,
  type Finding,
  type ValidationFindings,
  type Mutation,
  FIELD_DEFS,
} from "./schema";

/* ------------------------------------------------------------------ */
/*  Mutation Validation Engine                                         */
/*                                                                     */
/*  Returns errors (blocking save) and warnings (require review).      */
/*  All rules are self-contained and can be extended or replaced.      */
/* ------------------------------------------------------------------ */

export function validate(
  fields: MutationFields,
  allMutations: Mutation[],
  excludeId?: string
): ValidationFindings {
  const errors: Finding[] = [];
  const warnings: Finding[] = [];

  // ── 1. Missing mandatory fields ──────────────────────────────────
  for (const def of FIELD_DEFS) {
    if (def.required && !fields[def.key]?.value?.trim()) {
      errors.push({
        field: def.key,
        message: `${def.label} is missing.`,
        type: "error",
      });
    }
  }

  // ── 2. Date format ───────────────────────────────────────────────
  const dateVal = fields.dateOfEntry?.value?.trim();
  if (dateVal) {
    // Accept DD/MM/YYYY, DD-MM-YYYY, or ISO
    const ok =
      /^\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}$/.test(dateVal) ||
      /^\d{4}-\d{2}-\d{2}/.test(dateVal);
    if (!ok) {
      warnings.push({
        field: "dateOfEntry",
        message: "Date format may be incorrect. Expected DD/MM/YYYY.",
        type: "warning",
      });
    }
  }

  // ── 3. Land-area value ───────────────────────────────────────────
  const areaVal = fields.landArea?.value?.trim();
  if (areaVal) {
    const num = parseFloat(areaVal);
    if (isNaN(num)) {
      errors.push({
        field: "landArea",
        message: "Land area is not a valid number.",
        type: "error",
      });
    } else if (num <= 0) {
      errors.push({
        field: "landArea",
        message: "Land area must be a positive value.",
        type: "error",
      });
    } else if (num > 1000) {
      warnings.push({
        field: "landArea",
        message:
          "Land area is unusually large. Please verify.",
        type: "warning",
      });
    }
  }

  // ── 4. Entry-number format ───────────────────────────────────────
  const entryNo = fields.entryNo?.value?.trim();
  if (entryNo && !/^\d+([/\-]\d+)?$/.test(entryNo)) {
    warnings.push({
      field: "entryNo",
      message:
        "Entry number should be numeric. Please verify.",
      type: "warning",
    });
  }

  // ── 5. Khasra-number format ──────────────────────────────────────
  const khasra = fields.khasraNo?.value?.trim();
  if (khasra && !/^[\d/\-\s]+$/.test(khasra)) {
    warnings.push({
      field: "khasraNo",
      message:
        "Khasra number may contain unexpected characters. Please review.",
      type: "warning",
    });
  }

  // ── 6. Duplicate detection ──────────────────────────────────────
  const others = excludeId
    ? allMutations.filter((m) => m.id !== excludeId)
    : allMutations;

  if (entryNo) {
    const dup = others.find((m) => m.fields.entryNo?.value === entryNo);
    if (dup) {
      warnings.push({
        field: "entryNo",
        message:
          "A mutation entry with the same entry number already exists. Please review.",
        type: "warning",
      });
    }
  }

  const village = fields.village?.value?.trim();
  if (khasra && village) {
    const dup = others.find(
      (m) =>
        m.fields.khasraNo?.value?.trim() === khasra &&
        m.fields.village?.value?.trim() === village
    );
    if (dup) {
      warnings.push({
        field: "khasraNo",
        message:
          "A similar entry for this Khasra number in the same village already exists. Please review.",
        type: "warning",
      });
    }
  }

  // ── 7. Low-confidence machine fields ─────────────────────────────
  for (const def of FIELD_DEFS) {
    const fv = fields[def.key];
    if (
      fv?.source === "machine" &&
      fv.confidence !== undefined &&
      fv.confidence < 0.7
    ) {
      warnings.push({
        field: def.key,
        message: `Recognition confidence for ${def.label} is low (${Math.round(
          fv.confidence * 100
        )}%). Please review.`,
        type: "warning",
      });
    }
  }

  // ── 8. Cross-field: same previous & new holder ───────────────────
  const prev = fields.previousHolder?.value?.trim().toLowerCase();
  const next = fields.newHolder?.value?.trim().toLowerCase();
  if (prev && next && prev === next) {
    warnings.push({
      field: "newHolder",
      message:
        "Previous and new holder names are identical. Please verify.",
      type: "warning",
    });
  }

  return { errors, warnings };
}
