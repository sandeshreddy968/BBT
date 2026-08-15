"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { requestsApi } from "@/lib/api/requests";
import { catalogApi } from "@/lib/api/catalog";
import type { CatalogItem, ServiceRequest } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormSection } from "@/components/shared/FormSection";
import { NotesPanel } from "@/components/shared/NotesPanel";
import { formatDate, formatLabel } from "@/lib/utils/format";
import { ApiError } from "@/lib/api/client";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value ?? "—"}</dd>
    </div>
  );
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [catalogItem, setCatalogItem] = useState<CatalogItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [closeCode, setCloseCode] = useState("closed_resolved");
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
    <div>
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
        <div className="mb-2">
          <StatusBadge status={request.status} />
        </div>

        <FormSection title="Request Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact type" value={request.contact_type && formatLabel(request.contact_type)} />
            <Field label="Department" value={request.department} />
            <Field label="Location" value={request.location} />
            <Field label="Environment" value={request.environment && formatLabel(request.environment)} />
            <Field label="Assignment group" value={request.assignment_group} />
            <Field label="Created" value={formatDate(request.created_at)} />
          </div>
          {request.notes && (
            <div>
              <div className="text-sm text-slate-500">Notes</div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{request.notes}</p>
            </div>
          )}
        </FormSection>

        {(request.close_code || request.closed_at || request.resolution_code) && (
          <FormSection title="Resolution">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Resolution code" value={request.resolution_code && formatLabel(request.resolution_code)} />
              <Field label="Close code" value={request.close_code && formatLabel(request.close_code)} />
              <Field label="Closed at" value={formatDate(request.closed_at)} />
            </div>
          </FormSection>
        )}

        {isAdmin && (
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
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
            {request.status === "fulfilled" && (
              <>
                <Select value={closeCode} onChange={(e) => setCloseCode(e.target.value)} className="max-w-xs">
                  <option value="closed_resolved">Closed/Resolved</option>
                  <option value="closed_by_caller">Closed by Caller</option>
                  <option value="closed_no_action_needed">No Action Needed</option>
                  <option value="closed_duplicate">Duplicate</option>
                </Select>
                <Button disabled={busy} onClick={() => runAction(() => requestsApi.close(request.id, closeCode))}>
                  Close Request
                </Button>
              </>
            )}
          </div>
        )}
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Activity</h2>
        <NotesPanel ticketType="request" ticketId={request.id} />
      </Card>
    </div>
  );
}
