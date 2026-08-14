import { api } from "./client";
import type { User } from "@/lib/types";

export const usersApi = {
  list: () => api.get<User[]>("/users"),
  update: (id: number, data: { role?: string; is_active?: boolean; full_name?: string }) =>
    api.patch<User>(`/users/${id}`, data),
};
