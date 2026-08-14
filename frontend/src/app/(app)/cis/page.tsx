"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { cisApi } from "@/lib/api/cis";
import type { CI } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { formatLabel } from "@/lib/utils/format";
import { ApiError } from "@/lib/api/client";

export default function CIsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cis, setCis] = useState<CI[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cisApi
      .list()
      .then(setCis)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load configuration items"));
  }, []);

  return (
    <div>
      <PageHeader
        title="Configuration Items"
        description="Track hardware, software, and infrastructure assets."
        actions={
          user?.role === "admin" ? <Button onClick={() => router.push("/cis/new")}>New CI</Button> : undefined
        }
      />
      <Card>
        {error && (
          <div className="p-4">
            <ErrorState message={error} />
          </div>
        )}
        {!cis && !error && <LoadingState />}
        {cis && (
          <DataTable
            rows={cis}
            onRowClick={(row) => router.push(`/cis/${row.id}`)}
            emptyMessage="No configuration items found."
            columns={[
              { header: "Name", render: (c) => <span className="font-medium">{c.name}</span> },
              { header: "Type", render: (c) => formatLabel(c.ci_type) },
              { header: "Status", render: (c) => <StatusBadge status={c.status} /> },
              { header: "Location", render: (c) => c.location ?? "—" },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
