import { api } from "./client";
import type { Paginated, Problem, TicketClassificationFields } from "@/lib/types";

type ProblemCreateInput = Partial<TicketClassificationFields> & {
  title: string;
  description: string;
  priority: string;
  ci_id?: number | null;
  assigned_to_id?: number | null;
  impact?: string;
  urgency?: string;
};

export const problemsApi = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get<Paginated<Problem>>(`/problems${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => api.get<Problem>(`/problems/${id}`),
  create: (data: ProblemCreateInput) => api.post<Problem>("/problems", data),
  update: (id: number, data: Partial<Problem>) => api.patch<Problem>(`/problems/${id}`, data),
  linkIncident: (problemId: number, incidentId: number) =>
    api.post<Problem>(`/problems/${problemId}/link-incident/${incidentId}`),
  resolve: (id: number, root_cause: string, workaround?: string, resolution_code?: string) =>
    api.post<Problem>(`/problems/${id}/resolve`, { root_cause, workaround, resolution_code }),
  close: (id: number, close_code?: string) => api.post<Problem>(`/problems/${id}/close`, { close_code }),
};
