import type { AnalyticsData } from "../types";
import { IS_MOCK_MODE, apiFetch } from "./client";
import { getAnalyticsData } from "../mock/analytics";

export async function getAnalytics(): Promise<AnalyticsData> {
  if (IS_MOCK_MODE) return getAnalyticsData();
  return apiFetch<AnalyticsData>("/analytics");
}
