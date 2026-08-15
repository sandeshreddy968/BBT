"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  GitPullRequest,
  HelpCircle,
  Inbox,
  Server,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { dashboardApi } from "@/lib/api/dashboard";
import type { ActivityItem, DashboardBreakdown, DashboardSummary, TrendPoint } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { ApiError } from "@/lib/api/client";
import { StatTile } from "@/components/dashboard/StatTile";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { BreakdownBars } from "@/components/dashboard/BreakdownBars";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

const ADMIN_TILES = [
  { key: "open_incidents" as const, label: "Open Incidents", href: "/incidents", icon: AlertCircle, accent: "bg-red-50 text-red-600", bar: "bg-red-400" },
  { key: "my_incidents" as const, label: "My Incidents", href: "/incidents", icon: Inbox, accent: "bg-brand-50 text-brand-700", bar: "bg-brand-500" },
  { key: "open_problems" as const, label: "Open Problems", href: "/problems", icon: HelpCircle, accent: "bg-yellow-50 text-yellow-700", bar: "bg-yellow-400" },
  { key: "open_changes" as const, label: "Open Changes", href: "/changes", icon: GitPullRequest, accent: "bg-brand-mist/25 text-slate-700", bar: "bg-brand-mist" },
  { key: "pending_requests" as const, label: "Pending Requests", href: "/requests", icon: ShoppingCart, accent: "bg-brand-slate/20 text-slate-700", bar: "bg-brand-slate" },
  { key: "total_cis" as const, label: "Configuration Items", href: "/cis", icon: Server, accent: "bg-slate-100 text-brand-charcoal", bar: "bg-brand-charcoal" },
  { key: "published_articles" as const, label: "KB Articles", href: "/knowledge", icon: BookOpen, accent: "bg-brand-100 text-brand-700", bar: "bg-brand-600" },
];

const USER_TILES = [
  { key: "open_incidents" as const, label: "My Open Incidents", href: "/incidents", icon: AlertCircle, accent: "bg-red-50 text-red-600", bar: "bg-red-400" },
  { key: "my_incidents" as const, label: "My Total Incidents", href: "/incidents", icon: Inbox, accent: "bg-brand-50 text-brand-700", bar: "bg-brand-500" },
  { key: "pending_requests" as const, label: "My Pending Requests", href: "/requests", icon: ShoppingCart, accent: "bg-brand-slate/20 text-slate-700", bar: "bg-brand-slate" },
  { key: "published_articles" as const, label: "KB Articles", href: "/knowledge", icon: BookOpen, accent: "bg-brand-100 text-brand-700", bar: "bg-brand-600" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const tiles = isAdmin ? ADMIN_TILES : USER_TILES;

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [breakdown, setBreakdown] = useState<DashboardBreakdown | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[] | null>(null);
  const [activity, setActivity] = useState<ActivityItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      dashboardApi.summary(),
      dashboardApi.breakdown(),
      dashboardApi.trend(14),
      dashboardApi.activity(8),
    ])
      .then(([s, b, t, a]) => {
        setSummary(s);
        setBreakdown(b);
        setTrendData(t);
        setActivity(a);
      })
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
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tiles.map((tile) => (
              <StatTile
                key={tile.key}
                label={tile.label}
                value={summary[tile.key]}
                href={tile.href}
                icon={tile.icon}
                accent={tile.accent}
                bar={tile.bar}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h2 className="mb-1 text-sm font-semibold text-slate-900">Ticket volume</h2>
              <p className="mb-2 text-xs text-slate-500">Last 14 days</p>
              {trendData ? (
                <TrendChart data={trendData} series={isAdmin ? undefined : ["incidents", "requests"]} />
              ) : (
                <LoadingState />
              )}
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Recent activity</h2>
              {activity ? <ActivityFeed items={activity} /> : <LoadingState />}
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Incidents by status</h2>
              {breakdown ? <BreakdownBars items={breakdown.incidents_by_status} /> : <LoadingState />}
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Incidents by priority</h2>
              {breakdown ? (
                <BreakdownBars items={breakdown.incidents_by_priority} variant="severity" />
              ) : (
                <LoadingState />
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
