"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { incidentsApi } from "@/lib/api/incidents";
import type { Incident } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { formatDate } from "@/lib/utils/format";
import { ApiError } from "@/lib/api/client";

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    incidentsApi
      .list(params)
      .then((res) => setIncidents(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load incidents"));
  }, [status]);

  return (
    <div>
      <PageHeader
        title="Incidents"
        description="Track and resolve service disruptions."
        actions={
          <Button onClick={() => router.push("/incidents/new")}>Report Incident</Button>
        }
      />
      <div className="mb-4 flex gap-2">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-48">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="on_hold">On Hold</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </Select>
      </div>
      <Card>
        {error && (
          <div className="p-4">
            <ErrorState message={error} />
          </div>
        )}
        {!incidents && !error && <LoadingState />}
        {incidents && (
          <DataTable
            rows={incidents}
            onRowClick={(row) => router.push(`/incidents/${row.id}`)}
            emptyMessage="No incidents found."
            columns={[
              { header: "Number", render: (i) => <span className="font-medium">{i.number}</span> },
              { header: "Title", render: (i) => i.title },
              { header: "Priority", render: (i) => <PriorityBadge priority={i.priority} /> },
              { header: "Status", render: (i) => <StatusBadge status={i.status} /> },
              { header: "Created", render: (i) => formatDate(i.created_at) },
            ]}
          />
        )}
      </Card>
      <p className="mt-3 text-xs text-slate-400">
        Looking for a knowledge base article instead?{" "}
        <Link href="/knowledge" className="underline">
          Browse the KB
        </Link>
        .
      </p>
    </div>
  );
}
