"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { catalogApi } from "@/lib/api/catalog";
import { requestsApi } from "@/lib/api/requests";
import type { CatalogItem } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormSection } from "@/components/shared/FormSection";
import { ApiError } from "@/lib/api/client";

export default function CatalogItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [notes, setNotes] = useState("");
  const [contactType, setContactType] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [environment, setEnvironment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    catalogApi
      .get(Number(id))
      .then(setItem)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load item"));
  }, [id]);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const req = await requestsApi.create({
        catalog_item_id: Number(id),
        notes: notes || undefined,
        contact_type: contactType || undefined,
        department: department || undefined,
        location: location || undefined,
        environment: environment || undefined,
      });
      router.push(`/requests/${req.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit request");
      setSubmitting(false);
    }
  }

  if (error && !item) return <ErrorState message={error} />;
  if (!item) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title={item.name}
        actions={
          <Button variant="secondary" onClick={() => router.push("/catalog")}>
            Back to catalog
          </Button>
        }
      />
      <Card className="p-6">
        {item.category && (
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">{item.category}</div>
        )}
        <p className="text-sm text-slate-700">{item.description}</p>

        {error && (
          <div className="mt-4">
            <ErrorState message={error} />
          </div>
        )}

        <form onSubmit={handleRequest} className="border-t border-slate-100 pt-1">
          <FormSection title="Request Details">
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
                <Label>Department</Label>
                <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
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
              <Label>Notes (optional)</Label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional details…" />
            </div>
          </FormSection>
          <Button type="submit" className="mt-2" disabled={submitting}>
            {submitting ? "Submitting…" : "Request this"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
