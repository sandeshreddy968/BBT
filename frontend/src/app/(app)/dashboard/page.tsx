"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { dashboardApi } from "@/lib/api/dashboard";
import type { DashboardSummary } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { ApiError } from "@/lib/api/client";

const TILES: { key: keyof DashboardSummary; label: string; href: string }[] = [
  { key: "open_incidents", label: "Open Incidents", href: "/incidents" },
  { key: "my_incidents", label: "My Incidents", href: "/incidents" },
  { key: "open_problems", label: "Open Problems", href: "/problems" },
  { key: "open_changes", label: "Open Changes", href: "/changes" },
  { key: "pending_requests", label: "Pending Requests", href: "/requests" },
  { key: "total_cis", label: "Configuration Items", href: "/cis" },
  { key: "published_articles", label: "KB Articles", href: "/knowledge" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .summary()
      .then(setSummary)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load dashboard"));
  }, []);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.full_name ?? ""}`}
        description="Here's what's happening across ByteBridge IT services."
      />
      {error && <ErrorState message={error} />}
      {!summary && !error && <LoadingState />}
      {summary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {TILES.map((tile) => (
            <Link key={tile.key} href={tile.href}>
              <Card className="p-4 transition-shadow hover:shadow-md">
                <div className="text-2xl font-semibold text-slate-900">{summary[tile.key]}</div>
                <div className="mt-1 text-sm text-slate-500">{tile.label}</div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
