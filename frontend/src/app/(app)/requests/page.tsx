"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requestsApi } from "@/lib/api/requests";
import { catalogApi } from "@/lib/api/catalog";
import type { CatalogItem, ServiceRequest } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { formatDate } from "@/lib/utils/format";
import { ApiError } from "@/lib/api/client";

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequest[] | null>(null);
  const [catalogItems, setCatalogItems] = useState<Record<number, CatalogItem>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestsApi
      .list()
      .then((res) => setRequests(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load requests"));
    catalogApi
      .list()
      .then((items) => setCatalogItems(Object.fromEntries(items.map((i) => [i.id, i]))))
      .catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Service Requests" description="Track requests submitted through the service catalog." />
      <Card>
        {error && (
          <div className="p-4">
            <ErrorState message={error} />
          </div>
        )}
        {!requests && !error && <LoadingState />}
        {requests && (
          <DataTable
            rows={requests}
            onRowClick={(row) => router.push(`/requests/${row.id}`)}
            emptyMessage="No requests found."
            columns={[
              { header: "Number", render: (r) => <span className="font-medium">{r.number}</span> },
              { header: "Item", render: (r) => catalogItems[r.catalog_item_id]?.name ?? `#${r.catalog_item_id}` },
              { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
              { header: "Created", render: (r) => formatDate(r.created_at) },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
