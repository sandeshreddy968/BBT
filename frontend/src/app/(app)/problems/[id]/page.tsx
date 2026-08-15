"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { problemsApi } from "@/lib/api/problems";
import { incidentsApi } from "@/lib/api/incidents";
import type { Incident, Problem } from "@/lib/types";
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

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [linkedIncidents, setLinkedIncidents] = useState<Incident[]>([]);
  const [rootCause, setRootCause] = useState("");
  const [workaround, setWorkaround] = useState("");
  const [resolutionCode, setResolutionCode] = useState("solved_permanently");
  const [closeCode, setCloseCode] = useState("closed_resolved");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    problemsApi
      .get(Number(id))
      .then(setProblem)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load problem"));
  };

  useEffect(load, [id]);

  useEffect(() => {
    if (user?.role === "admin") {
      incidentsApi
        .list({ limit: "200" })
        .then((res) => setLinkedIncidents(res.items.filter((i) => i.problem_id === Number(id))))
        .catch(() => {});
    }
  }, [id, user]);

  async function runAction(action: () => Promise<Problem>) {
    setBusy(true);
    setError(null);
    try {
      setProblem(await action());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    await runAction(() => problemsApi.resolve(Number(id), rootCause, workaround || undefined, resolutionCode));
  }

  if (error && !problem) return <ErrorState message={error} />;
  if (!problem) return <LoadingState />;

  const isAdmin = user?.role === "admin";

  return (
    <div>
      <PageHeader
        title={`${problem.number}: ${problem.title}`}
        actions={
          <Button variant="secondary" onClick={() => router.push("/problems")}>
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
          <StatusBadge status={problem.status} />
          <PriorityBadge priority={problem.priority} />
        </div>

        <FormSection title="Problem Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" value={problem.category} />
            <Field label="Subcategory" value={problem.subcategory} />
          </div>
          <div>
            <div className="text-sm text-slate-500">Description</div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{problem.description}</p>
          </div>
        </FormSection>

        <FormSection title="Classification & Priority">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Impact" value={problem.impact && formatLabel(problem.impact)} />
            <Field label="Urgency" value={problem.urgency && formatLabel(problem.urgency)} />
            <Field label="Assignment group" value={problem.assignment_group} />
            <Field label="Assigned to" value={problem.assigned_to_id ? `User #${problem.assigned_to_id}` : null} />
          </div>
        </FormSection>

        <FormSection title="Additional Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Business service" value={problem.business_service} />
            <Field label="Location" value={problem.location} />
            <Field label="Department" value={problem.department} />
            <Field label="Environment" value={problem.environment && formatLabel(problem.environment)} />
            <Field label="Knowledge article" value={problem.knowledge_article} />
            <Field label="Created" value={formatDate(problem.created_at)} />
          </div>
        </FormSection>

        {(problem.root_cause || problem.workaround || problem.resolved_at || problem.closed_at) && (
          <FormSection title="Resolution">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Resolution code" value={problem.resolution_code && formatLabel(problem.resolution_code)} />
              <Field label="Resolved at" value={formatDate(problem.resolved_at)} />
              <Field label="Close code" value={problem.close_code && formatLabel(problem.close_code)} />
              <Field label="Closed at" value={formatDate(problem.closed_at)} />
            </div>
            {problem.root_cause && (
              <div>
                <div className="text-sm text-slate-500">Root cause</div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{problem.root_cause}</p>
              </div>
            )}
            {problem.workaround && (
              <div>
                <div className="text-sm text-slate-500">Workaround</div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{problem.workaround}</p>
              </div>
            )}
          </FormSection>
        )}

        {isAdmin && linkedIncidents.length > 0 && (
          <div className="border-t border-slate-100 py-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Linked incidents</h3>
            <ul className="space-y-1">
              {linkedIncidents.map((i) => (
                <li key={i.id}>
                  <button
                    onClick={() => router.push(`/incidents/${i.id}`)}
                    className="text-sm text-slate-700 underline hover:text-slate-900"
                  >
                    {i.number}: {i.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isAdmin && problem.status !== "resolved" && problem.status !== "closed" && (
          <form onSubmit={handleResolve} className="border-t border-slate-100 pt-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Resolve this problem</h3>
            <Label>Root cause</Label>
            <Textarea required rows={2} value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
            <div className="mt-3">
              <Label>Workaround (optional)</Label>
              <Textarea rows={2} value={workaround} onChange={(e) => setWorkaround(e.target.value)} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Select value={resolutionCode} onChange={(e) => setResolutionCode(e.target.value)} className="max-w-xs">
                <option value="solved_permanently">Solved (Permanently)</option>
                <option value="solved_workaround">Solved (Workaround)</option>
                <option value="not_reproducible">Not Reproducible</option>
                <option value="duplicate">Duplicate</option>
                <option value="not_an_issue">Not an Issue</option>
              </Select>
              <Button type="submit" disabled={busy}>
                Mark Resolved
              </Button>
            </div>
          </form>
        )}

        {isAdmin && problem.status === "resolved" && (
          <div className="border-t border-slate-100 pt-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Close this problem</h3>
            <div className="flex items-center gap-2">
              <Select value={closeCode} onChange={(e) => setCloseCode(e.target.value)} className="max-w-xs">
                <option value="closed_resolved">Closed/Resolved</option>
                <option value="closed_by_caller">Closed by Caller</option>
                <option value="closed_no_action_needed">No Action Needed</option>
                <option value="closed_duplicate">Duplicate</option>
              </Select>
              <Button disabled={busy} onClick={() => runAction(() => problemsApi.close(problem.id, closeCode))}>
                Close Problem
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Activity</h2>
        <NotesPanel ticketType="problem" ticketId={problem.id} />
      </Card>
    </div>
  );
}
