import { api } from "./client";
import type { DashboardSummary } from "@/lib/types";

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>("/dashboard/summary"),
};
