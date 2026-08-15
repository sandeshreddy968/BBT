"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useCountUp } from "@/lib/utils/useCountUp";

export function StatTile({
  label,
  value,
  href,
  icon: Icon,
  accent,
  bar,
}: {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
  accent: string;
  bar: string;
}) {
  const animated = useCountUp(value);

  return (
    <Link href={href}>
      <Card className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <div className={`h-1 ${bar}`} />
        <div className="flex items-start justify-between p-4">
          <div>
            <div className="text-2xl font-semibold tabular-nums text-slate-900">{animated}</div>
            <div className="mt-1 text-sm text-slate-500">{label}</div>
          </div>
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${accent}`}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
