"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { knowledgeApi } from "@/lib/api/knowledge";
import type { KnowledgeArticle } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { ApiError } from "@/lib/api/client";

export default function KnowledgePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [articles, setArticles] = useState<KnowledgeArticle[] | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      knowledgeApi
        .list(q || undefined)
        .then(setArticles)
        .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load articles"));
    }, 200);
    return () => clearTimeout(timeout);
  }, [q]);

  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        description="Self-service articles and troubleshooting guides."
        actions={
          user?.role === "admin" ? (
            <Button onClick={() => router.push("/knowledge/new")}>New Article</Button>
          ) : undefined
        }
      />
      <div className="mb-4">
        <Input placeholder="Search articles…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      </div>
      {error && <ErrorState message={error} />}
      {!articles && !error && <LoadingState />}
      {articles && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {articles.map((a) => (
            <Card
              key={a.id}
              className="cursor-pointer p-4 hover:shadow-md"
              onClick={() => router.push(`/knowledge/${a.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium text-slate-900">{a.title}</div>
                {a.status !== "published" && <StatusBadge status={a.status} />}
              </div>
              {a.category && <div className="mt-1 text-xs text-slate-400">{a.category}</div>}
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">{a.content}</p>
            </Card>
          ))}
          {articles.length === 0 && (
            <p className="text-sm text-slate-500">No articles found.</p>
          )}
        </div>
      )}
    </div>
  );
}
