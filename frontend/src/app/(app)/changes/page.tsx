"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { changesApi } from "@/lib/api/changes";
import type { Change } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { formatLabel } from "@/lib/utils/format";
import { ApiError } from "@/lib/api/client";

export default function ChangesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [changes, setChanges] = useState<Change[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    changesApi
      .list()
      .then((res) => setChanges(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load changes"));
  }, []);

  return (
    <div>
      <PageHeader
        title="Changes"
        description="Plan, approve, and track infrastructure changes."
        actions={
          user?.role === "admin" ? (
            <Button onClick={() => router.push("/changes/new")}>New Change</Button>
          ) : undefined
        }
      />
      <Card>
        {error && (
          <div className="p-4">
            <ErrorState message={error} />
          </div>
        )}
        {!changes && !error && <LoadingState />}
        {changes && (
          <DataTable
            rows={changes}
            onRowClick={(row) => router.push(`/changes/${row.id}`)}
            emptyMessage="No changes found."
            columns={[
              { header: "Number", render: (c) => <span className="font-medium">{c.number}</span> },
              { header: "Title", render: (c) => c.title },
              { header: "Type", render: (c) => formatLabel(c.change_type) },
              { header: "Risk", render: (c) => formatLabel(c.risk) },
              { header: "Status", render: (c) => <StatusBadge status={c.status} /> },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
