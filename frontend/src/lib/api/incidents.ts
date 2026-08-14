import { api } from "./client";
import type { Incident, Paginated } from "@/lib/types";

export const incidentsApi = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get<Paginated<Incident>>(`/incidents${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => api.get<Incident>(`/incidents/${id}`),
  create: (data: { title: string; description: string; priority: string; category?: string; ci_id?: number | null }) =>
    api.post<Incident>("/incidents", data),
  update: (id: number, data: Partial<Incident>) => api.patch<Incident>(`/incidents/${id}`, data),
  assign: (id: number, assigned_to_id: number) => api.post<Incident>(`/incidents/${id}/assign`, { assigned_to_id }),
  resolve: (id: number, resolution_notes: string) =>
    api.post<Incident>(`/incidents/${id}/resolve`, { resolution_notes }),
  close: (id: number) => api.post<Incident>(`/incidents/${id}/close`),
  reopen: (id: number) => api.post<Incident>(`/incidents/${id}/reopen`),
};
