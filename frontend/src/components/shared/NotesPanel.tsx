"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { notesApi } from "@/lib/api/notes";
import { ApiError } from "@/lib/api/client";
import type { TicketNote, TicketTypeName } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { formatRelativeTime } from "@/lib/utils/format";

export function NotesPanel({ ticketType, ticketId }: { ticketType: TicketTypeName; ticketId: number }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [notes, setNotes] = useState<TicketNote[] | null>(null);
  const [body, setBody] = useState("");
  const [customerVisible, setCustomerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    notesApi
      .list(ticketType, ticketId)
      .then(setNotes)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load activity"));
  };

  useEffect(load, [ticketType, ticketId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await notesApi.add(ticketType, ticketId, body, isAdmin ? customerVisible : true);
      setBody("");
      setCustomerVisible(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add note");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <Textarea
          rows={2}
          placeholder="Add a work note or comment…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex items-center justify-between">
          {isAdmin ? (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={customerVisible}
                onChange={(e) => setCustomerVisible(e.target.checked)}
                className="rounded border-slate-300"
              />
              Visible to customer
            </label>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={submitting || !body.trim()}>
            Add note
          </Button>
        </div>
      </form>

      {error && (
        <div className="mb-3">
          <ErrorState message={error} />
        </div>
      )}
      {!notes && !error && <LoadingState />}
      {notes && notes.length === 0 && <p className="text-sm text-slate-400">No activity yet.</p>}
      {notes && notes.length > 0 && (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-md border border-slate-200 p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs text-slate-400">{formatRelativeTime(note.created_at)}</span>
                {note.is_customer_visible ? (
                  <Badge className="bg-brand-50 text-brand-700 ring-brand-100">Customer visible</Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-600 ring-slate-200">Work note</Badge>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-800">{note.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
