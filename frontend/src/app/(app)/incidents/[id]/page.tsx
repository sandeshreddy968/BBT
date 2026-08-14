"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { incidentsApi } from "@/lib/api/incidents";
import type { Incident } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/Input";
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/utils/format";
import { ApiError } from "@/lib/api/client";

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    incidentsApi
      .get(Number(id))
      .then(setIncident)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load incident"));
  };

  useEffect(load, [id]);

  async function runAction(action: () => Promise<Incident>) {
    setBusy(true);
    setError(null);
    try {
      const updated = await action();
      setIncident(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  if (error && !incident) return <ErrorState message={error} />;
  if (!incident) return <LoadingState />;

  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`${incident.number}: ${incident.title}`}
        actions={
          <Button variant="secondary" onClick={() => router.push("/incidents")}>
            Back to list
          </Button>
        }
      />
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}
      <Card className="p-6">
        <div className="mb-4 flex gap-2">
          <StatusBadge status={incident.status} />
          <PriorityBadge priority={incident.priority} />
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Category</dt>
            <dd className="text-slate-900">{incident.category ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Created</dt>
            <dd className="text-slate-900">{formatDate(incident.created_at)}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <div className="text-sm text-slate-500">Description</div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{incident.description}</p>
        </div>
        {incident.resolution_notes && (
          <div className="mt-4">
            <div className="text-sm text-slate-500">Resolution notes</div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{incident.resolution_notes}</p>
          </div>
        )}

        {isAdmin && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <div className="flex flex-wrap gap-2">
              {incident.status !== "in_progress" && incident.status !== "resolved" && incident.status !== "closed" && (
                <Button disabled={busy} onClick={() => runAction(() => incidentsApi.assign(incident.id, user!.id))}>
                  Assign to me
                </Button>
              )}
              {(incident.status === "new" || incident.status === "in_progress" || incident.status === "on_hold") && (
                <div className="w-full">
                  <Label>Resolution notes</Label>
                  <Textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe how this was resolved…"
                  />
                  <Button
                    className="mt-2"
                    disabled={busy || !resolutionNotes}
                    onClick={() => runAction(() => incidentsApi.resolve(incident.id, resolutionNotes))}
                  >
                    Mark Resolved
                  </Button>
                </div>
              )}
              {incident.status === "resolved" && (
                <>
                  <Button disabled={busy} onClick={() => runAction(() => incidentsApi.close(incident.id))}>
                    Close Incident
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => runAction(() => incidentsApi.reopen(incident.id))}
                  >
                    Reopen
                  </Button>
                </>
              )}
              {incident.status === "closed" && (
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => runAction(() => incidentsApi.reopen(incident.id))}
                >
                  Reopen
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
