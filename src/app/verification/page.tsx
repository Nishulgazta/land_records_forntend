import type { Metadata } from "next";
import { listRecords } from "@/lib/api/records";
import { VerificationQueueView } from "@/components/records/verification-queue-view";

export const metadata: Metadata = { title: "Verification" };

export default async function VerificationPage() {
  const records = await listRecords();
  const queue = records.filter(
    (record) => record.status === "pending_verification" || record.status === "needs_review",
  );
  return <VerificationQueueView records={queue} />;
}
