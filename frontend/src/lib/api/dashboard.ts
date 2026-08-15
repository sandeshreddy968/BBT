import { api } from "./client";
import type { ActivityItem, DashboardBreakdown, DashboardSummary, TrendPoint } from "@/lib/types";

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>("/dashboard/summary"),
  breakdown: () => api.get<DashboardBreakdown>("/dashboard/breakdown"),
  trend: (days = 14) => api.get<TrendPoint[]>(`/dashboard/trend?days=${days}`),
  activity: (limit = 8) => api.get<ActivityItem[]>(`/dashboard/activity?limit=${limit}`),
};
