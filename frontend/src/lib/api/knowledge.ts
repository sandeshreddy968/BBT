import { api } from "./client";
import type { KnowledgeArticle } from "@/lib/types";

export const knowledgeApi = {
  list: (q?: string) => api.get<KnowledgeArticle[]>(`/knowledge${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  get: (id: number) => api.get<KnowledgeArticle>(`/knowledge/${id}`),
  create: (data: { title: string; content: string; category?: string }) =>
    api.post<KnowledgeArticle>("/knowledge", data),
  update: (id: number, data: Partial<KnowledgeArticle>) => api.patch<KnowledgeArticle>(`/knowledge/${id}`, data),
  publish: (id: number) => api.post<KnowledgeArticle>(`/knowledge/${id}/publish`),
  remove: (id: number) => api.delete<void>(`/knowledge/${id}`),
};
