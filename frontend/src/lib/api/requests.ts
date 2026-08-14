import { api } from "./client";
import type { Paginated, ServiceRequest } from "@/lib/types";

export const requestsApi = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get<Paginated<ServiceRequest>>(`/requests${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => api.get<ServiceRequest>(`/requests/${id}`),
  create: (data: { catalog_item_id: number; notes?: string }) => api.post<ServiceRequest>("/requests", data),
  approve: (id: number) => api.post<ServiceRequest>(`/requests/${id}/approve`),
  fulfill: (id: number) => api.post<ServiceRequest>(`/requests/${id}/fulfill`),
  reject: (id: number) => api.post<ServiceRequest>(`/requests/${id}/reject`),
};
