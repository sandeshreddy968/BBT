import { api } from "./client";
import type { CatalogItem } from "@/lib/types";

export const catalogApi = {
  list: () => api.get<CatalogItem[]>("/catalog"),
  get: (id: number) => api.get<CatalogItem>(`/catalog/${id}`),
  create: (data: Partial<CatalogItem>) => api.post<CatalogItem>("/catalog", data),
  update: (id: number, data: Partial<CatalogItem>) => api.patch<CatalogItem>(`/catalog/${id}`, data),
  remove: (id: number) => api.delete<void>(`/catalog/${id}`),
};
