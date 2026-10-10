import type { Metadata } from "next";
import { listRecords } from "@/lib/api/records";
import { RecordsListView } from "@/components/records/records-list-view";

export const metadata: Metadata = { title: "Land records" };

export default async function RecordsPage() {
  const records = await listRecords();
  return <RecordsListView records={records} />;
}
