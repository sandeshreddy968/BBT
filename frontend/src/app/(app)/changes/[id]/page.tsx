"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { changesApi } from "@/lib/api/changes";
import type { Change } from "@/lib/types";
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

export default function ChangeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [change, setChange] = useState<Change | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [closeCode, setCloseCode] = useState("closed_resolved");
  const [busy, setBusy] = useState(false);

  const load = () => {
    changesApi
      .get(Number(id))
      .then(setChange)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load change"));
  };

  useEffect(load, [id]);

  async function runAction(action: () => Promise<Change>) {
    setBusy(true);
    setError(null);
    try {
      setChange(await action());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  if (error && !change) return <ErrorState message={error} />;
  if (!change) return <LoadingState />;

  const isAdmin = user?.role === "admin";

  return (
    <div>
      <PageHeader
        title={`${change.number}: ${change.title}`}
        actions={
          <Button variant="secondary" onClick={() => router.push("/changes")}>
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
        <div className="mb-2 flex gap-2">
          <StatusBadge status={change.status} />
        </div>

        <FormSection title="Change Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" value={change.category} />
            <Field label="Subcategory" value={change.subcategory} />
          </div>
          <div>
            <div className="text-sm text-slate-500">Description</div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{change.description}</p>
          </div>
        </FormSection>

        <FormSection title="Classification & Risk">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Change type" value={formatLabel(change.change_type)} />
            <Field label="Risk" value={formatLabel(change.risk)} />
            <Field label="Assignment group" value={change.assignment_group} />
            <Field label="Planned start" value={formatDate(change.planned_start)} />
          </div>
        </FormSection>

        <FormSection title="Additional Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Business service" value={change.business_service} />
            <Field label="Location" value={change.location} />
            <Field label="Department" value={change.department} />
            <Field label="Environment" value={change.environment && formatLabel(change.environment)} />
            <Field label="Knowledge article" value={change.knowledge_article} />
            <Field label="Created" value={formatDate(change.created_at)} />
          </div>
        </FormSection>

        <FormSection title="Planning">
          {change.implementation_plan && (
            <div>
              <div className="text-sm text-slate-500">Implementation plan</div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{change.implementation_plan}</p>
            </div>
          )}
          {change.backout_plan && (
            <div>
              <div className="text-sm text-slate-500">Backout plan</div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{change.backout_plan}</p>
            </div>
          )}
        </FormSection>

        {(change.close_code || change.closed_at) && (
          <FormSection title="Resolution">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Close code" value={change.close_code && formatLabel(change.close_code)} />
              <Field label="Closed at" value={formatDate(change.closed_at)} />
            </div>
          </FormSection>
        )}

        {isAdmin && (
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
            {change.status === "draft" && (
              <Button disabled={busy} onClick={() => runAction(() => changesApi.submit(change.id))}>
                Submit for Approval
              </Button>
            )}
            {change.status === "submitted" && (
              <>
                <Button disabled={busy} onClick={() => runAction(() => changesApi.approve(change.id))}>
                  Approve
                </Button>
                <Button variant="danger" disabled={busy} onClick={() => runAction(() => changesApi.reject(change.id))}>
                  Reject
                </Button>
              </>
            )}
            {change.status === "approved" && (
              <Button disabled={busy} onClick={() => runAction(() => changesApi.implement(change.id))}>
                Mark Implemented
              </Button>
            )}
            {change.status === "implemented" && (
              <>
                <Select value={closeCode} onChange={(e) => setCloseCode(e.target.value)} className="max-w-xs">
                  <option value="closed_resolved">Closed/Resolved</option>
                  <option value="closed_by_caller">Closed by Caller</option>
                  <option value="closed_no_action_needed">No Action Needed</option>
                  <option value="closed_duplicate">Duplicate</option>
                </Select>
                <Button disabled={busy} onClick={() => runAction(() => changesApi.close(change.id, closeCode))}>
                  Close Change
                </Button>
              </>
            )}
          </div>
        )}
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Activity</h2>
        <NotesPanel ticketType="change" ticketId={change.id} />
      </Card>
    </div>
  );
}
