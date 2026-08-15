import { api } from "./client";
import type { Incident, Paginated, TicketClassificationFields } from "@/lib/types";

type IncidentCreateInput = Partial<TicketClassificationFields> & {
  title: string;
  description: string;
  priority: string;
  category?: string;
  ci_id?: number | null;
  contact_type?: string;
  impact?: string;
  urgency?: string;
  related_incident_id?: number | null;
};

export const incidentsApi = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get<Paginated<Incident>>(`/incidents${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => api.get<Incident>(`/incidents/${id}`),
  create: (data: IncidentCreateInput) => api.post<Incident>("/incidents", data),
  update: (id: number, data: Partial<Incident>) => api.patch<Incident>(`/incidents/${id}`, data),
  assign: (id: number, assigned_to_id: number) => api.post<Incident>(`/incidents/${id}/assign`, { assigned_to_id }),
  hold: (id: number, hold_reason: string) => api.post<Incident>(`/incidents/${id}/hold`, { hold_reason }),
  resolve: (id: number, resolution_notes: string, resolution_code?: string) =>
    api.post<Incident>(`/incidents/${id}/resolve`, { resolution_notes, resolution_code }),
  close: (id: number, close_code?: string) => api.post<Incident>(`/incidents/${id}/close`, { close_code }),
  reopen: (id: number) => api.post<Incident>(`/incidents/${id}/reopen`),
};
