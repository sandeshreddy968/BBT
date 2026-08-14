"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { requestsApi } from "@/lib/api/requests";
import { catalogApi } from "@/lib/api/catalog";
import type { CatalogItem, ServiceRequest } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { ApiError } from "@/lib/api/client";

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [catalogItem, setCatalogItem] = useState<CatalogItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    requestsApi
      .get(Number(id))
      .then((r) => {
        setRequest(r);
        catalogApi.get(r.catalog_item_id).then(setCatalogItem).catch(() => {});
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load request"));
  };

  useEffect(load, [id]);

  async function runAction(action: () => Promise<ServiceRequest>) {
    setBusy(true);
    setError(null);
    try {
      setRequest(await action());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  if (error && !request) return <ErrorState message={error} />;
  if (!request) return <LoadingState />;

  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`${request.number}: ${catalogItem?.name ?? "Service Request"}`}
        actions={
          <Button variant="secondary" onClick={() => router.push("/requests")}>
            Back to list
          </Button>
        }
      />
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}
      <Card className="p-6">
        <div className="mb-4">
          <StatusBadge status={request.status} />
        </div>
        {request.notes && (
          <div>
            <div className="text-sm text-slate-500">Notes</div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{request.notes}</p>
          </div>
        )}

        {isAdmin && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
            {request.status === "submitted" && (
              <>
                <Button disabled={busy} onClick={() => runAction(() => requestsApi.approve(request.id))}>
                  Approve
                </Button>
                <Button variant="danger" disabled={busy} onClick={() => runAction(() => requestsApi.reject(request.id))}>
                  Reject
                </Button>
              </>
            )}
            {(request.status === "approved" || request.status === "in_progress") && (
              <Button disabled={busy} onClick={() => runAction(() => requestsApi.fulfill(request.id))}>
                Mark Fulfilled
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
