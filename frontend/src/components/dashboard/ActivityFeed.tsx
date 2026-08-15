import Link from "next/link";
import { AlertCircle, GitPullRequest, HelpCircle, ShoppingCart } from "lucide-react";
import type { ActivityItem } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatRelativeTime } from "@/lib/utils/format";

const TYPE_META: Record<ActivityItem["type"], { icon: typeof AlertCircle; accent: string }> = {
  incident: { icon: AlertCircle, accent: "bg-red-50 text-red-600" },
  problem: { icon: HelpCircle, accent: "bg-yellow-50 text-yellow-700" },
  change: { icon: GitPullRequest, accent: "bg-brand-mist/25 text-slate-700" },
  request: { icon: ShoppingCart, accent: "bg-brand-50 text-brand-700" },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">No recent activity.</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => {
        const meta = TYPE_META[item.type];
        const Icon = meta.icon;
        return (
          <li key={`${item.type}-${item.number}`}>
            <Link
              href={item.url}
              className="flex items-center gap-3 py-2.5 transition-colors hover:bg-slate-50 -mx-2 px-2 rounded-md"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.accent}`}>
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-slate-800">
                  <span className="font-medium text-slate-500">{item.number}</span> {item.title}
                </span>
              </span>
              <StatusBadge status={item.status} />
              <span className="w-14 shrink-0 text-right text-xs text-slate-400">
                {formatRelativeTime(item.updated_at)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
