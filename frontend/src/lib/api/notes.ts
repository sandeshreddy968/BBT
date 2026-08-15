import { api } from "./client";
import type { TicketNote, TicketTypeName } from "@/lib/types";

const URL_PREFIX: Record<TicketTypeName, string> = {
  incident: "incidents",
  problem: "problems",
  change: "changes",
  request: "requests",
};

export const notesApi = {
  list: (type: TicketTypeName, id: number) => api.get<TicketNote[]>(`/${URL_PREFIX[type]}/${id}/notes`),
  add: (type: TicketTypeName, id: number, body: string, is_customer_visible: boolean) =>
    api.post<TicketNote>(`/${URL_PREFIX[type]}/${id}/notes`, { body, is_customer_visible }),
};
