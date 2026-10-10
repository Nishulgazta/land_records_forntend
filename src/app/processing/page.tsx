import type { Metadata } from "next";
import { listProcessingJobs } from "@/lib/api/processing";
import { listDocuments } from "@/lib/api/documents";
import { ProcessingListView } from "@/components/processing/processing-list-view";

export const metadata: Metadata = { title: "Processing" };

export default async function ProcessingPage() {
  const jobs = await listProcessingJobs();
  const documents = await listDocuments();
  return <ProcessingListView jobs={jobs} documents={documents} />;
}
