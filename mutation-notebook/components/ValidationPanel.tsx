"use client";

import React from "react";
import type { ValidationFindings } from "@/lib/mutation/schema";

interface ValidationPanelProps {
  findings: ValidationFindings;
  isValidating?: boolean;
}

export default function ValidationPanel({
  findings,
  isValidating,
}: ValidationPanelProps) {
  const total = findings.errors.length + findings.warnings.length;

  if (isValidating) {
    return (
      <div className="validation-panel">
        <div className="validation-panel__title">Validation</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
          <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
          <span className="loading-text">Validating fields…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="validation-panel">
      <div className="validation-panel__title">
        Validation {total > 0 && `(${total})`}
      </div>

      {total === 0 && (
        <div className="validation-pass">
          ✓ All checks passed. Ready to save or submit.
        </div>
      )}

      {findings.errors.map((f, i) => (
        <div className="validation-item" key={`e-${i}`}>
          <span className="validation-item__icon validation-item__icon--error">
            ✕
          </span>
          <span className="validation-item__text validation-item__text--error">
            {f.message}
          </span>
        </div>
      ))}

      {findings.warnings.map((f, i) => (
        <div className="validation-item" key={`w-${i}`}>
          <span className="validation-item__icon validation-item__icon--warning">
            !
          </span>
          <span className="validation-item__text validation-item__text--warning">
            {f.message}
          </span>
        </div>
      ))}
    </div>
  );
}
