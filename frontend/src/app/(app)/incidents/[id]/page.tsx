"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { incidentsApi } from "@/lib/api/incidents";
import type { Incident } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select, Textarea } from "@/components/ui/Input";
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormSection } from "@/components/shared/FormSection";
import { NotesPanel } from "@/components/shared/NotesPanel";
import { formatDate, formatLabel } from "@/lib/utils/format";
import { ApiError } from "@/lib/api/client";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value ?? "—"}</dd>
    </div>
  );
}

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionCode, setResolutionCode] = useState("solved_permanently");
  const [closeCode, setCloseCode] = useState("closed_resolved");
  const [holdReason, setHoldReason] = useState("");
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
  const isOpen = incident.status === "new" || incident.status === "in_progress" || incident.status === "on_hold";

  return (
    <div>
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
        <div className="mb-2 flex gap-2">
          <StatusBadge status={incident.status} />
          <PriorityBadge priority={incident.priority} />
        </div>

        <FormSection title="Incident Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact type" value={incident.contact_type && formatLabel(incident.contact_type)} />
            <Field label="Service" value={incident.service} />
            <Field label="Category" value={incident.category} />
            <Field label="Subcategory" value={incident.subcategory} />
          </div>
          <div>
            <div className="text-sm text-slate-500">Description</div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{incident.description}</p>
          </div>
        </FormSection>

        <FormSection title="Classification & Priority">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Impact" value={incident.impact && formatLabel(incident.impact)} />
            <Field label="Urgency" value={incident.urgency && formatLabel(incident.urgency)} />
            <Field label="Assignment group" value={incident.assignment_group} />
            <Field label="Assigned to" value={incident.assigned_to_id ? `User #${incident.assigned_to_id}` : null} />
          </div>
        </FormSection>

        <FormSection title="Additional Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Business service" value={incident.business_service} />
            <Field label="Location" value={incident.location} />
            <Field label="Department" value={incident.department} />
            <Field label="Environment" value={incident.environment && formatLabel(incident.environment)} />
            <Field label="Knowledge article" value={incident.knowledge_article} />
            <Field label="Created" value={formatDate(incident.created_at)} />
          </div>
        </FormSection>

        {(incident.resolution_notes || incident.resolved_at || incident.closed_at) && (
          <FormSection title="Resolution">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Resolution code" value={incident.resolution_code && formatLabel(incident.resolution_code)} />
              <Field label="Resolved at" value={formatDate(incident.resolved_at)} />
              <Field label="Close code" value={incident.close_code && formatLabel(incident.close_code)} />
              <Field label="Closed at" value={formatDate(incident.closed_at)} />
            </div>
            {incident.resolution_notes && (
              <div>
                <div className="text-sm text-slate-500">Resolution notes</div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{incident.resolution_notes}</p>
              </div>
            )}
          </FormSection>
        )}

        {isAdmin && (
          <div className="mt-2 border-t border-slate-200 pt-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</h3>
            <div className="flex flex-wrap items-start gap-2">
              {isOpen && incident.status !== "in_progress" && (
                <Button disabled={busy} onClick={() => runAction(() => incidentsApi.assign(incident.id, user!.id))}>
                  Assign to me
                </Button>
              )}
              {isOpen && (
                <div className="w-full max-w-xs">
                  <Label>Hold reason</Label>
                  <div className="flex gap-2">
                    <input
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 text-sm"
                      value={holdReason}
                      onChange={(e) => setHoldReason(e.target.value)}
                      placeholder="e.g. Awaiting vendor part"
                    />
                    <Button
                      variant="secondary"
                      disabled={busy || !holdReason}
                      onClick={() => runAction(() => incidentsApi.hold(incident.id, holdReason))}
                    >
                      Hold
                    </Button>
                  </div>
                </div>
              )}
              {isOpen && (
                <div className="w-full">
                  <Label>Resolution notes</Label>
                  <Textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe how this was resolved…"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <Select value={resolutionCode} onChange={(e) => setResolutionCode(e.target.value)} className="max-w-xs">
                      <option value="solved_permanently">Solved (Permanently)</option>
                      <option value="solved_workaround">Solved (Workaround)</option>
                      <option value="not_reproducible">Not Reproducible</option>
                      <option value="duplicate">Duplicate</option>
                      <option value="not_an_issue">Not an Issue</option>
                    </Select>
                    <Button
                      disabled={busy || !resolutionNotes}
                      onClick={() =>
                        runAction(() => incidentsApi.resolve(incident.id, resolutionNotes, resolutionCode))
                      }
                    >
                      Mark Resolved
                    </Button>
                  </div>
                </div>
              )}
              {incident.status === "resolved" && (
                <>
                  <div className="flex items-center gap-2">
                    <Select value={closeCode} onChange={(e) => setCloseCode(e.target.value)} className="max-w-xs">
                      <option value="closed_resolved">Closed/Resolved</option>
                      <option value="closed_by_caller">Closed by Caller</option>
                      <option value="closed_no_action_needed">No Action Needed</option>
                      <option value="closed_duplicate">Duplicate</option>
                    </Select>
                    <Button disabled={busy} onClick={() => runAction(() => incidentsApi.close(incident.id, closeCode))}>
                      Close Incident
                    </Button>
                  </div>
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

      <Card className="mt-6 p-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Activity</h2>
        <NotesPanel ticketType="incident" ticketId={incident.id} />
      </Card>
    </div>
  );
}
