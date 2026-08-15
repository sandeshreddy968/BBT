"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { incidentsApi } from "@/lib/api/incidents";
import { cisApi } from "@/lib/api/cis";
import { useAuth } from "@/lib/auth/AuthContext";
import type { CI } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormSection } from "@/components/shared/FormSection";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { ErrorState } from "@/components/shared/LoadingState";
import { ApiError } from "@/lib/api/client";

export default function NewIncidentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cis, setCis] = useState<CI[]>([]);

  // Incident information
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactType, setContactType] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [service, setService] = useState("");
  const [ciId, setCiId] = useState("");

  // Classification & priority
  const [impact, setImpact] = useState("");
  const [urgency, setUrgency] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignmentGroup, setAssignmentGroup] = useState("");

  // Additional information
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
      const incident = await incidentsApi.create({
        title,
        description,
        priority,
        category: category || undefined,
        subcategory: subcategory || undefined,
        contact_type: contactType || undefined,
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
      router.push(`/incidents/${incident.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create incident");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Report an Incident" />
      <Card className="p-6">
        {error && (
          <div className="mb-4">
            <ErrorState message={error} />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FormSection title="Incident Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Number</Label>
                <Input disabled value="Auto-generated" />
              </div>
              <div>
                <Label>Caller</Label>
                <Input disabled value={user?.full_name ?? ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact type</Label>
                <Select value={contactType} onChange={(e) => setContactType(e.target.value)}>
                  <option value="">None</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="self_service">Self-Service</option>
                  <option value="chat">Chat</option>
                </Select>
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
            <div>
              <Label>Service</Label>
              <Input value={service} onChange={(e) => setService(e.target.value)} />
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
              {submitting ? "Submitting…" : "Submit Incident"}
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
