"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import NotebookCanvas, {
  type CanvasHandle,
  type Stroke,
} from "@/components/mutation-notebook/NotebookCanvas";
import Toolbar from "@/components/mutation-notebook/Toolbar";
import FieldsPanel from "@/components/mutation-notebook/FieldsPanel";
import ValidationPanel from "@/components/mutation-notebook/ValidationPanel";
import StatusBadge from "@/components/mutation-notebook/StatusBadge";
import PageNavigator from "@/components/mutation-notebook/PageNavigator";
import type {
  Mutation,
  MutationFields,
  FieldKey,
  MutationStatus,
  RecognitionResult,
  ValidationFindings,
  Page,
} from "@/lib/mutation-notebook/schema";
import { emptyFields } from "@/lib/mutation-notebook/schema";

/* ─── Toast helper ─────────────────────────────────────────────────── */
type ToastType = "success" | "error" | "warning" | "info";

function useToast() {
  const [toast, setToast] = useState<{
    msg: string;
    type: ToastType;
  } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = (msg: string, type: ToastType = "info") => {
    clearTimeout(timer.current);
    setToast({ msg, type });
    timer.current = setTimeout(() => setToast(null), 4000);
  };

  const el = toast ? (
    <div className={`toast toast--${toast.type}`}>{toast.msg}</div>
  ) : null;

  return { show, el };
}

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function NotebookEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  // ─── State ──────────────────────────────────────────────────────
  const [mutation, setMutation] = useState<Mutation | null>(null);
  const [fields, setFields] = useState<MutationFields>(emptyFields());
  const [pages, setPages] = useState<Page[]>([
    { id: crypto.randomUUID(), imageData: "", strokes: [] },
  ]);
  const [currentPage, setCurrentPage] = useState(0);
  const [recognition, setRecognition] = useState<RecognitionResult | null>(
    null
  );
  const [findings, setFindings] = useState<ValidationFindings>({
    errors: [],
    warnings: [],
  });
  const [status, setStatus] = useState<MutationStatus>("draft");

  // ─── UI state ───────────────────────────────────────────────────
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [penWidth, setPenWidth] = useState(2.5);
  const [eraserWidth, setEraserWidth] = useState(24);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<"fields" | "validation">(
    "fields"
  );

  const canvasRef = useRef<CanvasHandle>(null);
  const isReadOnly = status === "awaiting_review";

  // ─── Load mutation ──────────────────────────────────────────────
  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/mutation-notebook/mutations/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => {
        const m: Mutation = d.mutation;
        setMutation(m);
        setFields(m.fields);
        setStatus(m.status);
        setRecognition(m.recognition);
        setFindings(m.findings);
        if (m.pages.length > 0) {
          setPages(m.pages);
        }
      })
      .catch(() => {
        toast.show("Entry not found.", "error");
        router.push("/mutation-notebook");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // ─── Restore strokes when page changes ─────────────────────────
  useEffect(() => {
    if (canvasRef.current && pages[currentPage]) {
      canvasRef.current.setStrokes(pages[currentPage].strokes as Stroke[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // ─── Save strokes before switching pages ────────────────────────
  const persistCurrentPageStrokes = useCallback(() => {
    if (!canvasRef.current) return;
    const strokes = canvasRef.current.getStrokes();
    const img = canvasRef.current.exportImage();
    setPages((prev) => {
      const updated = [...prev];
      updated[currentPage] = {
        ...updated[currentPage],
        strokes,
        imageData: img,
      };
      return updated;
    });
  }, [currentPage]);

  // ─── Field change handler ───────────────────────────────────────
  const handleFieldChange = useCallback(
    (key: FieldKey, value: string) => {
      setFields((prev) => ({
        ...prev,
        [key]: {
          value,
          source: "manual" as const,
          // Clear confidence when user manually edits a machine field
          confidence: undefined,
        },
      }));
      // Update status if user edits after recognition
      if (status === "recognized") {
        setStatus("corrected");
      }
    },
    [status]
  );

  // ─── Recognize handwriting ──────────────────────────────────────
  const handleRecognize = useCallback(async () => {
    if (!canvasRef.current) return;
    persistCurrentPageStrokes();

    const imageData = canvasRef.current.exportImage();
    if (!imageData) {
      toast.show("Canvas is empty. Write something first.", "warning");
      return;
    }

    setRecognizing(true);
    try {
      const res = await fetch("/api/mutation-notebook/mutations/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Recognition failed");

      const rec: RecognitionResult = data.recognition;
      setRecognition(rec);

      // Merge recognized fields — only fill empty fields or update machine-sourced ones
      setFields((prev) => {
        const merged = { ...prev };
        if (rec.extractedFields) {
          for (const [key, val] of Object.entries(rec.extractedFields)) {
            const k = key as FieldKey;
            if (
              val &&
              (!merged[k]?.value || merged[k]?.source === "machine")
            ) {
              merged[k] = {
                value: val.value,
                source: "machine",
                confidence: val.confidence,
              };
            }
          }
        }
        return merged;
      });

      setStatus("recognized");
      setActiveTab("fields");

      if (rec.isDemo) {
        toast.show(
          "⚠ Demo mode — fields populated with sample data. No real OCR.",
          "warning"
        );
      } else {
        toast.show("Handwriting recognized. Review the extracted fields.", "success");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Recognition failed.";
      toast.show(msg, "error");
    } finally {
      setRecognizing(false);
    }
  }, [persistCurrentPageStrokes, toast]);

  // ─── Validate fields ───────────────────────────────────────────
  const handleValidate = useCallback(async () => {
    setValidating(true);
    try {
      const res = await fetch("/api/mutation-notebook/mutations/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields, excludeId: params.id }),
      });
      const data = await res.json();
      setFindings(data.findings);
      setActiveTab("validation");
      if (data.findings.errors.length === 0 && data.findings.warnings.length === 0) {
        toast.show("All validation checks passed!", "success");
      }
    } catch {
      toast.show("Validation request failed.", "error");
    } finally {
      setValidating(false);
    }
  }, [fields, params.id, toast]);

  // ─── Save draft ─────────────────────────────────────────────────
  const handleSave = useCallback(async (): Promise<boolean> => {
    persistCurrentPageStrokes();
    setSaving(true);

    // Get fresh strokes + image for current page
    const currentStrokes = canvasRef.current?.getStrokes() || [];
    const currentImage = canvasRef.current?.exportImage() || "";
    const savedPages = pages.map((p, i) =>
      i === currentPage
        ? { ...p, strokes: currentStrokes, imageData: currentImage }
        : p
    );

    try {
      const res = await fetch(
        `/api/mutation-notebook/mutations/${params.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields,
            pages: savedPages,
            recognition,
            status,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setMutation(data.mutation);
      setStatus(data.mutation.status);
      setFindings(data.mutation.findings);
      toast.show("Draft saved successfully.", "success");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed.";
      toast.show(msg, "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [fields, pages, currentPage, recognition, status, params.id, persistCurrentPageStrokes, toast]);

  // ─── Submit for review ──────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    // Save first
    const saved = await handleSave();
    if (!saved) return;

    try {
      const res = await fetch(
        `/api/mutation-notebook/mutations/${params.id}/submit-review`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        if (data.findings) setFindings(data.findings);
        throw new Error(data.error || "Submission failed");
      }

      setStatus("awaiting_review");
      setMutation(data.mutation);
      toast.show(
        "Entry submitted for review. It can no longer be edited.",
        "success"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submit failed.";
      toast.show(msg, "error");
    }
  }, [handleSave, params.id, toast]);

  // ─── Keyboard shortcuts ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        canvasRef.current?.undo();
      } else if (e.ctrlKey && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
        e.preventDefault();
        canvasRef.current?.redo();
      } else if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  // ─── Page navigation ───────────────────────────────────────────
  const handlePageChange = useCallback(
    (page: number) => {
      persistCurrentPageStrokes();
      setCurrentPage(page);
    },
    [persistCurrentPageStrokes]
  );

  const handleAddPage = useCallback(() => {
    persistCurrentPageStrokes();
    const newPage: Page = {
      id: crypto.randomUUID(),
      imageData: "",
      strokes: [],
    };
    setPages((prev) => [...prev, newPage]);
    setCurrentPage(pages.length);
  }, [persistCurrentPageStrokes, pages.length]);

  // ─── Computed sets for field highlighting ───────────────────────
  const fieldErrors = new Set(findings.errors.map((f) => f.field));
  const fieldWarnings = new Set(findings.warnings.map((f) => f.field));

  // ─── Canvas undo/redo state tracking ───────────────────────────
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const wrapper = canvasRef.current
        ? (document.querySelector(".canvas-notebook") as HTMLElement)
        : null;
      if (wrapper) {
        setCanUndo(wrapper.dataset.hasUndo === "true");
        setCanRedo(wrapper.dataset.hasRedo === "true");
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // ─── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 52px)",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div className="spinner" />
        <div className="loading-text">Loading mutation entry…</div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="editor">
      {/* Top bar */}
      <div className="editor__top-bar">
        <button
          className="btn btn--ghost"
          onClick={() => router.push("/mutation-notebook")}
        >
          ← Back
        </button>
        <span className="editor__top-bar-title">
          {fields.entryNo?.value
            ? `Entry #${fields.entryNo.value}`
            : "New Mutation Entry"}
          {fields.village?.value && ` — ${fields.village.value}`}
        </span>
        <StatusBadge status={status} />
        <button
          className="btn btn--secondary"
          onClick={handleSave}
          disabled={saving || isReadOnly}
        >
          {saving ? "Saving…" : "💾 Save Draft"}
        </button>
        <button
          className="btn btn--success"
          onClick={handleSubmit}
          disabled={
            saving || isReadOnly || findings.errors.length > 0
          }
        >
          📤 Submit for Review
        </button>
      </div>

      {/* Body — canvas + fields */}
      <div className="editor__body">
        {/* Left: canvas area */}
        <div className="editor__canvas-area">
          <Toolbar
            tool={tool}
            penWidth={penWidth}
            eraserWidth={eraserWidth}
            canUndo={canUndo}
            canRedo={canRedo}
            isRecognizing={recognizing}
            onToolChange={setTool}
            onPenWidthChange={setPenWidth}
            onEraserWidthChange={setEraserWidth}
            onUndo={() => canvasRef.current?.undo()}
            onRedo={() => canvasRef.current?.redo()}
            onClear={() => canvasRef.current?.clear()}
            onRecognize={handleRecognize}
          />

          <div className="canvas-wrapper">
            {recognizing && (
              <div className="loading-overlay">
                <div className="spinner" />
                <div className="loading-text">
                  Analyzing handwriting…
                </div>
              </div>
            )}
            <NotebookCanvas
              ref={canvasRef}
              tool={tool}
              penWidth={penWidth}
              eraserWidth={eraserWidth}
            />
          </div>

          <PageNavigator
            currentPage={currentPage}
            totalPages={pages.length}
            onPageChange={handlePageChange}
            onAddPage={handleAddPage}
          />
        </div>

        {/* Right: fields + validation */}
        <div className="editor__fields-area">
          {/* Tabs (visible on narrow screens where panels stack) */}
          <div className="tabs">
            <button
              className={`tabs__tab ${
                activeTab === "fields" ? "tabs__tab--active" : ""
              }`}
              onClick={() => setActiveTab("fields")}
            >
              Extracted Fields
            </button>
            <button
              className={`tabs__tab ${
                activeTab === "validation" ? "tabs__tab--active" : ""
              }`}
              onClick={() => setActiveTab("validation")}
            >
              Validation{" "}
              {findings.errors.length + findings.warnings.length > 0 && (
                <span
                  style={{
                    background:
                      findings.errors.length > 0
                        ? "var(--error)"
                        : "var(--warning)",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    marginLeft: 4,
                    fontWeight: 700,
                  }}
                >
                  {findings.errors.length + findings.warnings.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === "fields" && (
            <FieldsPanel
              fields={fields}
              recognition={recognition}
              onFieldChange={handleFieldChange}
              fieldWarnings={fieldWarnings}
              fieldErrors={fieldErrors}
            />
          )}

          {activeTab === "validation" && (
            <ValidationPanel
              findings={findings}
              isValidating={validating}
            />
          )}

          {/* Actions */}
          <div className="fields-actions">
            <button
              className="btn btn--warning"
              onClick={handleValidate}
              disabled={validating}
            >
              {validating ? "Validating…" : "✓ Run Validation"}
            </button>
          </div>
        </div>
      </div>

      {/* Read-only overlay */}
      {isReadOnly && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--st-review)",
            color: "#fff",
            padding: "8px 20px",
            borderRadius: 8,
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            boxShadow: "var(--shadow-lg)",
            zIndex: 200,
          }}
        >
          🔒 This entry has been submitted for review and is read-only.
        </div>
      )}

      {toast.el}
    </div>
  );
}
