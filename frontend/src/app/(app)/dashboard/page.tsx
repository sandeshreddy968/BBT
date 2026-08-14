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

const TILES: { key: keyof DashboardSummary; label: string; href: string; accent: string; bar: string }[] = [
  {
    key: "open_incidents",
    label: "Open Incidents",
    href: "/incidents",
    accent: "bg-red-50 text-red-700",
    bar: "bg-red-400",
  },
  {
    key: "my_incidents",
    label: "My Incidents",
    href: "/incidents",
    accent: "bg-brand-50 text-brand-700",
    bar: "bg-brand-500",
  },
  {
    key: "open_problems",
    label: "Open Problems",
    href: "/problems",
    accent: "bg-yellow-50 text-yellow-800",
    bar: "bg-yellow-400",
  },
  {
    key: "open_changes",
    label: "Open Changes",
    href: "/changes",
    accent: "bg-brand-mist/25 text-slate-700",
    bar: "bg-brand-mist",
  },
  {
    key: "pending_requests",
    label: "Pending Requests",
    href: "/requests",
    accent: "bg-brand-slate/20 text-slate-700",
    bar: "bg-brand-slate",
  },
  {
    key: "total_cis",
    label: "Configuration Items",
    href: "/cis",
    accent: "bg-slate-100 text-brand-charcoal",
    bar: "bg-brand-charcoal",
  },
  {
    key: "published_articles",
    label: "KB Articles",
    href: "/knowledge",
    accent: "bg-brand-100 text-brand-700",
    bar: "bg-brand-600",
  },
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
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <div className={`h-1 ${tile.bar}`} />
                <div className="p-4">
                  <div
                    className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-lg font-semibold ${tile.accent}`}
                  >
                    {summary[tile.key]}
                  </div>
                  <div className="text-sm text-slate-500">{tile.label}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
