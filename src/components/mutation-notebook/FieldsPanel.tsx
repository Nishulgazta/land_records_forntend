"use client";

import React from "react";
import type {
  MutationFields,
  FieldKey,
  RecognitionResult,
} from "@/lib/mutation-notebook/schema";
import { FIELD_DEFS } from "@/lib/mutation-notebook/schema";

interface FieldsPanelProps {
  fields: MutationFields;
  recognition: RecognitionResult | null;
  onFieldChange: (key: FieldKey, value: string) => void;
  fieldWarnings?: Set<string>;
  fieldErrors?: Set<string>;
}

export default function FieldsPanel({
  fields,
  recognition,
  onFieldChange,
  fieldWarnings = new Set(),
  fieldErrors = new Set(),
}: FieldsPanelProps) {
  return (
    <div className="fields-panel">
      <div className="fields-panel__title">
        Mutation Record Fields
      </div>

      {/* Demo banner */}
      {recognition?.isDemo && (
        <div className="fields-panel__demo-banner">
          <span>
            <strong>Demo mode:</strong> These fields contain fictional sample
            data for demonstration only. No real handwriting recognition was
            performed.
          </span>
        </div>
      )}

      {FIELD_DEFS.map((def) => {
        const fv = fields[def.key];
        const hasWarning = fieldWarnings.has(def.key);
        const hasError = fieldErrors.has(def.key);
        const isMachine = fv.source === "machine";
        const lowConfidence =
          isMachine &&
          fv.confidence !== undefined &&
          fv.confidence < 0.7;

        let inputClass = "field-group__input";
        if (hasError) inputClass += " field-group__input--error";
        else if (hasWarning) inputClass += " field-group__input--warning";
        if (isMachine) inputClass += " field-group__input--machine";

        return (
          <div className="field-group" key={def.key}>
            <div className="field-group__label">
              <span className="field-group__label-text">
                {def.label}
                {def.required && (
                  <span className="field-group__label-required"> *</span>
                )}
              </span>
              <span className="field-group__label-hi">{def.labelHi}</span>

              {isMachine && (
                <span className="field-group__source field-group__source--machine">
                  AI
                </span>
              )}
              {!isMachine && fv.value && (
                <span className="field-group__source field-group__source--manual">
                  Manual
                </span>
              )}
              {isMachine && fv.confidence !== undefined && (
                <span
                  className={`field-group__confidence ${
                    lowConfidence
                      ? "field-group__confidence--low"
                      : ""
                  }`}
                >
                  {Math.round(fv.confidence * 100)}%
                </span>
              )}
            </div>

            {def.inputType === "select" && def.options ? (
              <select
                className={inputClass}
                value={fv.value}
                onChange={(e) => onFieldChange(def.key, e.target.value)}
              >
                <option value="">{def.placeholder}</option>
                {def.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={def.inputType === "number" ? "text" : "text"}
                className={inputClass}
                value={fv.value}
                placeholder={def.placeholder}
                onChange={(e) => onFieldChange(def.key, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
