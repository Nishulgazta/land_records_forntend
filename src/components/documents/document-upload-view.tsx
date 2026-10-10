"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import type { DocumentType } from "@/lib/types";
import { IS_MOCK_MODE } from "@/lib/api/client";
import { DOCUMENT_TYPE_LABELS } from "@/lib/mock/documents";
import { uploadDocument } from "@/lib/api/documents";
import { Button } from "@/components/ui/button";
import { Select, Input, Textarea, Field } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { SampleNote, ProgressBar } from "@/components/ui/states";
import { useToast } from "@/components/providers/toast-provider";

const DOCUMENT_TYPES: DocumentType[] = [
  "land_register",
  "title_deed",
  "record_of_rights",
  "mutation_document",
  "cadastral_map",
  "patta_passbook",
  "other",
];

export function DocumentUploadView() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentType>("land_register");
  const [language, setLanguage] = useState("English");
  const [notes, setNotes] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ documentId: string } | null>(null);

  const handleFile = useCallback((selected: File | null) => {
    if (!selected) return;
    setFile(selected);
    if (!title) {
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
  }, [title]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      handleFile(dropped);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleUseSample = useCallback(() => {
    const sample = new File(["sample"], "sample-land-document.pdf", { type: "application/pdf" });
    setFile(sample);
    setTitle("Sample land document");
    setType("land_register");
    setLanguage("English");
    setNotes("Generated sample file for demonstration");
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      const ticket = await uploadDocument(file, type, {
        onProgress: (percent) => setProgress(percent),
      });
      setResult({ documentId: ticket.documentId });
      pushToast({ title: "Upload simulated", description: "Document upload (simulated) completed.", tone: "info" });
    } catch (error) {
      pushToast({ title: "Upload failed", description: error instanceof Error ? error.message : "Upload failed", tone: "error" });
    } finally {
      setUploading(false);
      setProgress(100);
    }
  }, [file, type, pushToast]);

  if (result) {
    return (
      <div className="space-y-5">
        {IS_MOCK_MODE ? (
          <SampleNote>
            Uploads are simulated in mock mode; no file is stored or parsed.
          </SampleNote>
        ) : null}
        <PageHeader
          title="Upload complete"
          description="The document upload has been simulated."
          parent={{ label: "Documents", href: "/documents" }}
        />
        <div className="card p-6 space-y-4 max-w-2xl">
          <p className="text-ink">
            New document created: <span className="font-medium">{result.documentId}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={() => {
                startTransition(() => {
                  router.push(`/documents/${result.documentId}`);
                });
              }}
              disabled={isPending}
            >
              View document
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                startTransition(() => {
                  router.push("/documents");
                });
              }}
              disabled={isPending}
            >
              Back to documents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {IS_MOCK_MODE ? (
        <SampleNote>
          Uploads are simulated in mock mode; no file is stored, sent, or parsed. The flow is for demonstration only.
        </SampleNote>
      ) : null}
      <PageHeader
        title="Upload document"
        description="Drag and drop a file or fill the form to start processing (simulated)."
        parent={{ label: "Documents", href: "/documents" }}
      />
      <div className="card p-6 space-y-6">
        <div
          className={`border-2 border-dashed rounded-md p-8 text-center transition-colors ${
            isDragging
              ? "border-brand-500 bg-brand-50/50"
              : "border-line hover:border-line-strong"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <UploadCloud className="size-8 mx-auto text-ink-3 mb-3" />
          <p className="text-ink font-medium">Drop file here</p>
          <p className="text-sm text-ink-3 mt-1">Or click to browse</p>
          <input
            type="file"
            className="hidden"
            id="file-input"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
          <label
            htmlFor="file-input"
            className="mt-4 inline-flex items-center justify-center rounded-md border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2 cursor-pointer"
          >
            Browse files
          </label>
          {file && (
            <p className="mt-3 text-sm text-ink-2">{file.name}</p>
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={handleUseSample}>
            Use sample file
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field id="title" label="Title">
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </Field>
          <Field id="type" label="Document type">
            <Select
              id="type"
              value={type}
              onChange={(event) => setType(event.target.value as DocumentType)}
            >
              {DOCUMENT_TYPES.map((value) => (
                <option key={value} value={value}>
                  {DOCUMENT_TYPE_LABELS[value]}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="language" label="Language">
            <Select
              id="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="English">English</option>
              <option value="Telugu">Telugu</option>
              <option value="Telugu / English">Telugu / English</option>
              <option value="—">—</option>
            </Select>
          </Field>
          <Field id="notes" label="Notes (optional)">
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
            />
          </Field>
          {uploading && (
            <div className="space-y-2">
              <ProgressBar value={progress} />
              <p className="text-xs text-ink-3 tabular-nums">{progress}%</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={!file || uploading}
            >
              {uploading ? "Uploading..." : "Upload (simulated)"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
