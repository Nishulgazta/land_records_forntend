import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDocumentById } from "@/lib/api/documents";
import { getProcessingJobForDocument } from "@/lib/api/processing";
import { listRecords } from "@/lib/api/records";
import { DocumentDetailView } from "@/components/documents/document-detail-view";

export const metadata: Metadata = { title: "Document detail" };

export default async function DocumentDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let document;
  try {
    document = await getDocumentById(id);
  } catch {
    notFound();
  }

  let job = null;
  try {
    job = await getProcessingJobForDocument(id);
  } catch {
    job = null;
  }

  const records = await listRecords();
  const linkedRecords = records.filter((record) => record.documentId === id);

  return (
    <DocumentDetailView
      document={document}
      job={job}
      linkedRecords={linkedRecords}
    />
  );
}
