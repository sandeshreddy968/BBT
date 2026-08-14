"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { knowledgeApi } from "@/lib/api/knowledge";
import type { KnowledgeArticle } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { ApiError } from "@/lib/api/client";

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    knowledgeApi
      .get(Number(id))
      .then(setArticle)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load article"));
  }, [id]);

  async function handlePublish() {
    setBusy(true);
    try {
      setArticle(await knowledgeApi.publish(Number(id)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to publish");
    } finally {
      setBusy(false);
    }
  }

  if (error && !article) return <ErrorState message={error} />;
  if (!article) return <LoadingState />;

  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={article.title}
        actions={
          <Button variant="secondary" onClick={() => router.push("/knowledge")}>
            Back to Knowledge Base
          </Button>
        }
      />
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <StatusBadge status={article.status} />
          {article.category && <span className="text-xs text-slate-400">{article.category}</span>}
          <span className="text-xs text-slate-400">· {article.view_count} views</span>
        </div>
        <p className="whitespace-pre-wrap text-sm text-slate-800">{article.content}</p>

        {isAdmin && (
          <div className="mt-6 flex gap-2 border-t border-slate-200 pt-4">
            <Button variant="secondary" onClick={() => router.push(`/knowledge/${article.id}/edit`)}>
              Edit
            </Button>
            {article.status !== "published" && (
              <Button disabled={busy} onClick={handlePublish}>
                Publish
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
