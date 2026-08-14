import { api } from "./client";
import type { CI } from "@/lib/types";

export const cisApi = {
  list: () => api.get<CI[]>("/cis"),
  get: (id: number) => api.get<CI>(`/cis/${id}`),
  create: (data: Partial<CI>) => api.post<CI>("/cis", data),
  update: (id: number, data: Partial<CI>) => api.patch<CI>(`/cis/${id}`, data),
  remove: (id: number) => api.delete<void>(`/cis/${id}`),
};
