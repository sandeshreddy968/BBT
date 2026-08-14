"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { changesApi } from "@/lib/api/changes";
import type { Change } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDate, formatLabel } from "@/lib/utils/format";
import { ApiError } from "@/lib/api/client";

export default function ChangeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [change, setChange] = useState<Change | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    <div className="max-w-3xl">
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
        <div className="mb-4 flex gap-2">
          <StatusBadge status={change.status} />
        </div>
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Type</dt>
            <dd className="text-slate-900">{formatLabel(change.change_type)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Risk</dt>
            <dd className="text-slate-900">{formatLabel(change.risk)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Planned start</dt>
            <dd className="text-slate-900">{formatDate(change.planned_start)}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <div className="text-sm text-slate-500">Description</div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{change.description}</p>
        </div>
        {change.implementation_plan && (
          <div className="mt-4">
            <div className="text-sm text-slate-500">Implementation plan</div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{change.implementation_plan}</p>
          </div>
        )}
        {change.backout_plan && (
          <div className="mt-4">
            <div className="text-sm text-slate-500">Backout plan</div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{change.backout_plan}</p>
          </div>
        )}

        {isAdmin && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
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
              <Button disabled={busy} onClick={() => runAction(() => changesApi.close(change.id))}>
                Close Change
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
