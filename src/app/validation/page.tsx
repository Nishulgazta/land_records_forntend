import type { Metadata } from "next";
import { listIssues } from "@/lib/api/validation";
import { ValidationListView } from "@/components/records/validation-list-view";

export const metadata: Metadata = { title: "Validation" };

export default async function ValidationPage() {
  const issues = await listIssues();
  return <ValidationListView issues={issues} />;
}
