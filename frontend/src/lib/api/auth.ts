import { api } from "./client";
import type { User } from "@/lib/types";

export const authApi = {
  me: () => api.get<User>("/auth/me"),
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post<User>("/auth/register", data),
};
