"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { catalogApi } from "@/lib/api/catalog";
import { requestsApi } from "@/lib/api/requests";
import type { CatalogItem } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/Input";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { ApiError } from "@/lib/api/client";

export default function CatalogItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [notes, setNotes] = useState("");
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
      const req = await requestsApi.create({ catalog_item_id: Number(id), notes: notes || undefined });
      router.push(`/requests/${req.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit request");
      setSubmitting(false);
    }
  }

  if (error && !item) return <ErrorState message={error} />;
  if (!item) return <LoadingState />;

  return (
    <div className="max-w-2xl">
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

        <form onSubmit={handleRequest} className="mt-6 border-t border-slate-200 pt-4">
          <Label>Notes (optional)</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional details…" />
          <Button type="submit" className="mt-3" disabled={submitting}>
            {submitting ? "Submitting…" : "Request this"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
