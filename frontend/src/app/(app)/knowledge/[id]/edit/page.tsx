"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { knowledgeApi } from "@/lib/api/knowledge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { ApiError } from "@/lib/api/client";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    knowledgeApi
      .get(Number(id))
      .then((a) => {
        setTitle(a.title);
        setContent(a.content);
        setCategory(a.category ?? "");
        setLoaded(true);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load article"));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await knowledgeApi.update(Number(id), { title, content, category: category || undefined });
      router.push(`/knowledge/${id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save article");
      setSubmitting(false);
    }
  }

  if (error && !loaded) return <ErrorState message={error} />;
  if (!loaded) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Edit Article" />
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
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea required rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
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
