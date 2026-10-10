import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDocumentById } from "@/lib/api/documents";
import { getParcelById } from "@/lib/api/parcels";
import { getRecordById } from "@/lib/api/records";
import { RecordDetailView } from "@/components/records/record-detail-view";

export const metadata: Metadata = { title: "Land record detail" };

export default async function RecordDetailPage({
  params,
}: PageProps<"/records/[id]">) {
  const { id } = await params;
  const record = await getRecordById(id).catch(() => null);
  if (!record) notFound();

  const parcel = record.parcelId
    ? await getParcelById(record.parcelId).catch(() => null)
    : null;
  const document = await getDocumentById(record.documentId).catch(() => null);

  return <RecordDetailView record={record} parcel={parcel} document={document} />;
}
