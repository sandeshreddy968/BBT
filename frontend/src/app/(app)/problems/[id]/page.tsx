"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { problemsApi } from "@/lib/api/problems";
import { incidentsApi } from "@/lib/api/incidents";
import type { Incident, Problem } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/Input";
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { ApiError } from "@/lib/api/client";

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [linkedIncidents, setLinkedIncidents] = useState<Incident[]>([]);
  const [rootCause, setRootCause] = useState("");
  const [workaround, setWorkaround] = useState("");
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

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const updated = await problemsApi.resolve(Number(id), rootCause, workaround || undefined);
      setProblem(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to resolve problem");
    } finally {
      setBusy(false);
    }
  }

  if (error && !problem) return <ErrorState message={error} />;
  if (!problem) return <LoadingState />;

  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-3xl">
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
        <div className="mb-4 flex gap-2">
          <StatusBadge status={problem.status} />
          <PriorityBadge priority={problem.priority} />
        </div>
        <div>
          <div className="text-sm text-slate-500">Description</div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{problem.description}</p>
        </div>
        {problem.root_cause && (
          <div className="mt-4">
            <div className="text-sm text-slate-500">Root cause</div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{problem.root_cause}</p>
          </div>
        )}
        {problem.workaround && (
          <div className="mt-4">
            <div className="text-sm text-slate-500">Workaround</div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{problem.workaround}</p>
          </div>
        )}

        {isAdmin && linkedIncidents.length > 0 && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <div className="mb-2 text-sm font-medium text-slate-700">Linked incidents</div>
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
          <form onSubmit={handleResolve} className="mt-6 border-t border-slate-200 pt-4">
            <div className="mb-2 text-sm font-medium text-slate-700">Resolve this problem</div>
            <Label>Root cause</Label>
            <Textarea required rows={2} value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
            <div className="mt-3">
              <Label>Workaround (optional)</Label>
              <Textarea rows={2} value={workaround} onChange={(e) => setWorkaround(e.target.value)} />
            </div>
            <Button type="submit" className="mt-3" disabled={busy}>
              Mark Resolved
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
