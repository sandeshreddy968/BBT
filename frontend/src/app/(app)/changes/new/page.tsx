"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { changesApi } from "@/lib/api/changes";
import { cisApi } from "@/lib/api/cis";
import { problemsApi } from "@/lib/api/problems";
import type { CI, Problem } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { ErrorState } from "@/components/shared/LoadingState";
import { ApiError } from "@/lib/api/client";

export default function NewChangePage() {
  const router = useRouter();
  const [cis, setCis] = useState<CI[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [changeType, setChangeType] = useState("standard");
  const [risk, setRisk] = useState("low");
  const [ciId, setCiId] = useState("");
  const [problemId, setProblemId] = useState("");
  const [implementationPlan, setImplementationPlan] = useState("");
  const [backoutPlan, setBackoutPlan] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cisApi.list().then(setCis).catch(() => {});
    problemsApi
      .list()
      .then((res) => setProblems(res.items))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const change = await changesApi.create({
        title,
        description,
        change_type: changeType,
        risk,
        ci_id: ciId ? Number(ciId) : null,
        problem_id: problemId ? Number(problemId) : null,
        implementation_plan: implementationPlan || undefined,
        backout_plan: backoutPlan || undefined,
      });
      router.push(`/changes/${change.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create change");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Request a Change" />
      <Card className="p-6">
        {error && (
          <div className="mb-4">
            <ErrorState message={error} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Change type</Label>
              <Select value={changeType} onChange={(e) => setChangeType(e.target.value)}>
                <option value="standard">Standard</option>
                <option value="normal">Normal</option>
                <option value="emergency">Emergency</option>
              </Select>
            </div>
            <div>
              <Label>Risk</Label>
              <Select value={risk} onChange={(e) => setRisk(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Related CI (optional)</Label>
              <Select value={ciId} onChange={(e) => setCiId(e.target.value)}>
                <option value="">None</option>
                {cis.map((ci) => (
                  <option key={ci.id} value={ci.id}>
                    {ci.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Related problem (optional)</Label>
              <Select value={problemId} onChange={(e) => setProblemId(e.target.value)}>
                <option value="">None</option>
                {problems.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.number}: {p.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Implementation plan</Label>
            <Textarea rows={2} value={implementationPlan} onChange={(e) => setImplementationPlan(e.target.value)} />
          </div>
          <div>
            <Label>Backout plan</Label>
            <Textarea rows={2} value={backoutPlan} onChange={(e) => setBackoutPlan(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Create Change"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
