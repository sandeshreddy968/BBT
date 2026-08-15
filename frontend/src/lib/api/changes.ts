import { api } from "./client";
import type { Change, Paginated, TicketClassificationFields } from "@/lib/types";

type ChangeCreateInput = Partial<TicketClassificationFields> & {
  title: string;
  description: string;
  change_type: string;
  risk: string;
  ci_id?: number | null;
  problem_id?: number | null;
  implementation_plan?: string;
  backout_plan?: string;
};

export const changesApi = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get<Paginated<Change>>(`/changes${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => api.get<Change>(`/changes/${id}`),
  create: (data: ChangeCreateInput) => api.post<Change>("/changes", data),
  update: (id: number, data: Partial<Change>) => api.patch<Change>(`/changes/${id}`, data),
  submit: (id: number) => api.post<Change>(`/changes/${id}/submit`),
  approve: (id: number) => api.post<Change>(`/changes/${id}/approve`),
  reject: (id: number) => api.post<Change>(`/changes/${id}/reject`),
  implement: (id: number) => api.post<Change>(`/changes/${id}/implement`),
  close: (id: number, close_code?: string) => api.post<Change>(`/changes/${id}/close`, { close_code }),
};
