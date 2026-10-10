import type { Metadata } from "next";
import { listAllParcels } from "@/lib/api/parcels";
import { ExportView } from "@/components/export/export-view";

export const metadata: Metadata = {
  title: "Export",
  description: "Generate downloadable exports of the demonstration parcels.",
};

export default async function ExportPage() {
  const parcels = await listAllParcels();
  return <ExportView parcels={parcels} />;
}
