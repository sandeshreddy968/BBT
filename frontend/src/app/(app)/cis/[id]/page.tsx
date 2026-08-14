"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { cisApi } from "@/lib/api/cis";
import type { CI } from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatLabel } from "@/lib/utils/format";
import { ApiError } from "@/lib/api/client";

export default function CIDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [ci, setCi] = useState<CI | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    cisApi
      .get(Number(id))
      .then(setCi)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load CI"));
  }, [id]);

  async function handleStatusChange(status: string) {
    setBusy(true);
    try {
      setCi(await cisApi.update(Number(id), { status }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update status");
    } finally {
      setBusy(false);
    }
  }

  if (error && !ci) return <ErrorState message={error} />;
  if (!ci) return <LoadingState />;

  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={ci.name}
        actions={
          <Button variant="secondary" onClick={() => router.push("/cis")}>
            Back to CMDB
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
          <StatusBadge status={ci.status} />
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Type</dt>
            <dd className="text-slate-900">{formatLabel(ci.ci_type)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Serial number</dt>
            <dd className="text-slate-900">{ci.serial_number ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Location</dt>
            <dd className="text-slate-900">{ci.location ?? "—"}</dd>
          </div>
        </dl>
        {ci.description && (
          <div className="mt-4">
            <div className="text-sm text-slate-500">Description</div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{ci.description}</p>
          </div>
        )}

        {isAdmin && (
          <div className="mt-6 max-w-xs border-t border-slate-200 pt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Change status</label>
            <Select disabled={busy} value={ci.status} onChange={(e) => handleStatusChange(e.target.value)}>
              <option value="in_use">In Use</option>
              <option value="in_stock">In Stock</option>
              <option value="retired">Retired</option>
              <option value="under_maintenance">Under Maintenance</option>
            </Select>
          </div>
        )}
      </Card>
    </div>
  );
}
