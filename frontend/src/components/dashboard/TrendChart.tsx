"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "@/lib/types";

// First 3 slots of the validated categorical palette (color-formula.md) —
// pre-validated for adjacent + all-pairs CVD safety in both modes.
const SERIES = [
  { key: "incidents", label: "Incidents", color: "#2a78d6" },
  { key: "requests", label: "Requests", color: "#eb6834" },
  { key: "changes", label: "Changes", color: "#1baf7a" },
] as const;

function formatDay(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <div className="mb-1.5 font-medium text-slate-500">{label ? formatDay(label) : ""}</div>
      <div className="space-y-1">
        {payload.map((entry) => {
          const series = SERIES.find((s) => s.key === entry.dataKey);
          return (
            <div key={entry.dataKey} className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-semibold tabular-nums text-slate-900">{entry.value}</span>
              <span className="text-slate-500">{series?.label ?? entry.dataKey}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TrendChart({ data, series }: { data: TrendPoint[]; series?: readonly string[] }) {
  const visibleSeries = SERIES.filter((s) => !series || series.includes(s.key));

  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        {visibleSeries.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="inline-block h-0.5 w-3 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<TrendTooltip />} />
          {visibleSeries.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={s.color}
              fillOpacity={0.1}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
