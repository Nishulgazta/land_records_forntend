import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDocumentById } from "@/lib/api/documents";
import { getRecordById } from "@/lib/api/records";
import { listIssuesForRecord } from "@/lib/api/validation";
import { RecordValidationView } from "@/components/records/record-validation-view";

export const metadata: Metadata = { title: "Record validation" };

export default async function RecordValidationPage({
  params,
}: PageProps<"/validation/[recordId]">) {
  const { recordId } = await params;
  const record = await getRecordById(recordId).catch(() => null);
  if (!record) notFound();

  const issues = await listIssuesForRecord(recordId);
  const document = record.documentId
    ? await getDocumentById(record.documentId).catch(() => null)
    : null;

  return (
    <RecordValidationView record={record} issues={issues} document={document} />
  );
}
