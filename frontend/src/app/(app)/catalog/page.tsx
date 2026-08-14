"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { catalogApi } from "@/lib/api/catalog";
import type { CatalogItem } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { ApiError } from "@/lib/api/client";

export default function CatalogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    catalogApi
      .list()
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load catalog"));
  };

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await catalogApi.create({ name, description, category: category || undefined });
      setName("");
      setDescription("");
      setCategory("");
      setShowNewForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create item");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Service Catalog"
        description="Browse available services and submit a request."
        actions={
          user?.role === "admin" ? (
            <Button variant="secondary" onClick={() => setShowNewForm((v) => !v)}>
              {showNewForm ? "Cancel" : "New Catalog Item"}
            </Button>
          ) : undefined
        }
      />
      {showNewForm && (
        <Card className="mb-6 p-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <Button type="submit" disabled={submitting}>
              Create
            </Button>
          </form>
        </Card>
      )}
      {error && <ErrorState message={error} />}
      {!items && !error && <LoadingState />}
      {items && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer p-4 hover:shadow-md"
              onClick={() => router.push(`/catalog/${item.id}`)}
            >
              {item.category && (
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  {item.category}
                </div>
              )}
              <div className="font-medium text-slate-900">{item.name}</div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
