import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDocumentById } from "@/lib/api/documents";
import { getRecordById } from "@/lib/api/records";
import { listIssuesForRecord } from "@/lib/api/validation";
import { listVerificationEvents } from "@/lib/api/verification";
import { VerificationWorkspaceView } from "@/components/records/verification-workspace-view";

export const metadata: Metadata = { title: "Verification workspace" };

export default async function VerificationDetailPage({
  params,
}: PageProps<"/verification/[recordId]">) {
  const { recordId } = await params;
  const record = await getRecordById(recordId).catch(() => null);
  if (!record) notFound();

  const issues = await listIssuesForRecord(recordId);
  const events = await listVerificationEvents(recordId);
  const document = record.documentId
    ? await getDocumentById(record.documentId).catch(() => null)
    : null;

  return (
    <VerificationWorkspaceView
      record={record}
      issues={issues}
      events={events}
      document={document}
    />
  );
}
