"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { problemsApi } from "@/lib/api/problems";
import { cisApi } from "@/lib/api/cis";
import type { CI } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormSection } from "@/components/shared/FormSection";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { ErrorState } from "@/components/shared/LoadingState";
import { ApiError } from "@/lib/api/client";

export default function NewProblemPage() {
  const router = useRouter();
  const [cis, setCis] = useState<CI[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [service, setService] = useState("");
  const [ciId, setCiId] = useState("");

  const [impact, setImpact] = useState("");
  const [urgency, setUrgency] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignmentGroup, setAssignmentGroup] = useState("");

  const [businessService, setBusinessService] = useState("");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [environment, setEnvironment] = useState("");
  const [knowledgeArticle, setKnowledgeArticle] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cisApi.list().then(setCis).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const problem = await problemsApi.create({
        title,
        description,
        priority,
        category: category || undefined,
        subcategory: subcategory || undefined,
        service: service || undefined,
        business_service: businessService || undefined,
        location: location || undefined,
        department: department || undefined,
        environment: environment || undefined,
        assignment_group: assignmentGroup || undefined,
        knowledge_article: knowledgeArticle || undefined,
        impact: impact || undefined,
        urgency: urgency || undefined,
        ci_id: ciId ? Number(ciId) : null,
      });
      router.push(`/problems/${problem.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create problem");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Log a Problem" />
      <Card className="p-6">
        {error && (
          <div className="mb-4">
            <ErrorState message={error} />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FormSection title="Problem Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Network" />
              </div>
              <div>
                <Label>Subcategory</Label>
                <Input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Service</Label>
                <Input value={service} onChange={(e) => setService(e.target.value)} />
              </div>
              <div>
                <Label>Configuration item</Label>
                <Select value={ciId} onChange={(e) => setCiId(e.target.value)}>
                  <option value="">None</option>
                  {cis.map((ci) => (
                    <option key={ci.id} value={ci.id}>
                      {ci.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label>Short description</Label>
              <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </FormSection>

          <FormSection title="Classification & Priority">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Impact</Label>
                <Select value={impact} onChange={(e) => setImpact(e.target.value)}>
                  <option value="">None</option>
                  <option value="high">1 - High</option>
                  <option value="medium">2 - Medium</option>
                  <option value="low">3 - Low</option>
                </Select>
              </div>
              <div>
                <Label>Urgency</Label>
                <Select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                  <option value="">None</option>
                  <option value="high">1 - High</option>
                  <option value="medium">2 - Medium</option>
                  <option value="low">3 - Low</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </div>
              <div>
                <Label>Assignment group</Label>
                <Input value={assignmentGroup} onChange={(e) => setAssignmentGroup(e.target.value)} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Additional Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Business service</Label>
                <Input value={businessService} onChange={(e) => setBusinessService(e.target.value)} />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
              <div>
                <Label>Environment</Label>
                <Select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
                  <option value="">None</option>
                  <option value="production">Production</option>
                  <option value="uat">UAT</option>
                  <option value="development">Development</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Knowledge article</Label>
              <Input value={knowledgeArticle} onChange={(e) => setKnowledgeArticle(e.target.value)} />
            </div>
          </FormSection>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Create Problem"}
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
