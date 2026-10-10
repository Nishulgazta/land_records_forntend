import type { Metadata } from "next";
import { DocumentUploadView } from "@/components/documents/document-upload-view";

export const metadata: Metadata = { title: "Upload document" };

export default function DocumentUploadPage() {
  return <DocumentUploadView />;
}
