import type { Metadata } from "next";
import { listDocuments } from "@/lib/api/documents";
import { DocumentsListView } from "@/components/documents/documents-list-view";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const documents = await listDocuments();
  return <DocumentsListView documents={documents} />;
}
