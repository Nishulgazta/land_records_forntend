import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProcessingJob } from "@/lib/api/processing";
import { getDocumentById } from "@/lib/api/documents";
import { ProcessingDetailView } from "@/components/processing/processing-detail-view";

export const metadata: Metadata = { title: "Processing job" };

export default async function ProcessingDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let job;
  try {
    job = await getProcessingJob(id);
  } catch {
    notFound();
  }

  let document;
  try {
    document = await getDocumentById(job.documentId);
  } catch {
    notFound();
  }

  return <ProcessingDetailView job={job} document={document} />;
}
