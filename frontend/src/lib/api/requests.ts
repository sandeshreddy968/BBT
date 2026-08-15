import { api } from "./client";
import type { Paginated, ServiceRequest, TicketClassificationFields } from "@/lib/types";

type RequestCreateInput = Partial<TicketClassificationFields> & {
  catalog_item_id: number;
  notes?: string;
  contact_type?: string;
  ci_id?: number | null;
};

export const requestsApi = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get<Paginated<ServiceRequest>>(`/requests${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => api.get<ServiceRequest>(`/requests/${id}`),
  create: (data: RequestCreateInput) => api.post<ServiceRequest>("/requests", data),
  approve: (id: number) => api.post<ServiceRequest>(`/requests/${id}/approve`),
  fulfill: (id: number) => api.post<ServiceRequest>(`/requests/${id}/fulfill`),
  reject: (id: number) => api.post<ServiceRequest>(`/requests/${id}/reject`),
  close: (id: number, close_code?: string, resolution_code?: string) =>
    api.post<ServiceRequest>(`/requests/${id}/close`, { close_code, resolution_code }),
};
