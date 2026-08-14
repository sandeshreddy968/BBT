"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { problemsApi } from "@/lib/api/problems";
import type { Problem } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { formatDate } from "@/lib/utils/format";
import { ApiError } from "@/lib/api/client";

export default function ProblemsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    problemsApi
      .list()
      .then((res) => setProblems(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load problems"));
  }, []);

  return (
    <div>
      <PageHeader
        title="Problems"
        description="Investigate root causes behind recurring incidents."
        actions={
          user?.role === "admin" ? (
            <Button onClick={() => router.push("/problems/new")}>New Problem</Button>
          ) : undefined
        }
      />
      <Card>
        {error && (
          <div className="p-4">
            <ErrorState message={error} />
          </div>
        )}
        {!problems && !error && <LoadingState />}
        {problems && (
          <DataTable
            rows={problems}
            onRowClick={(row) => router.push(`/problems/${row.id}`)}
            emptyMessage="No problems found."
            columns={[
              { header: "Number", render: (p) => <span className="font-medium">{p.number}</span> },
              { header: "Title", render: (p) => p.title },
              { header: "Priority", render: (p) => <PriorityBadge priority={p.priority} /> },
              { header: "Status", render: (p) => <StatusBadge status={p.status} /> },
              { header: "Created", render: (p) => formatDate(p.created_at) },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
