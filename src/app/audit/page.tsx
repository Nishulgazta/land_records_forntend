import type { Metadata } from "next";
import { listAuditEvents } from "@/lib/api/audit";
import { AuditView } from "@/components/audit/audit-view";

export const metadata: Metadata = {
  title: "Audit log",
  description: "Chronological trail of sample document, record and export events.",
};

export default async function AuditPage() {
  const events = await listAuditEvents();
  return <AuditView events={events} />;
}
