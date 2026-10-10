import type { Metadata } from "next";
import { getAnalytics } from "@/lib/api/analytics";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Operational metrics across the bundled sample dataset.",
};

export default async function AnalyticsPage() {
  const data = await getAnalytics();
  return <AnalyticsView data={data} />;
}
