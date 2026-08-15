import { formatLabel } from "@/lib/utils/format";
import type { BreakdownItem } from "@/lib/types";

// Fixed status/severity scale (never themed) — low/medium/high/critical mapped
// onto good -> warning -> serious -> critical, always paired with a text label.
const SEVERITY_COLOR: Record<string, string> = {
  low: "#0ca30c",
  medium: "#fab219",
  high: "#ec835a",
  critical: "#d03b3b",
};

const SINGLE_HUE = "#35914d"; // brand-600 — 3.96:1 on white

export function BreakdownBars({
  items,
  variant = "single",
}: {
  items: BreakdownItem[];
  variant?: "single" | "severity";
}) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const pct = Math.round((item.count / max) * 100);
        const color = variant === "severity" ? SEVERITY_COLOR[item.label] ?? SINGLE_HUE : SINGLE_HUE;
        return (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-24 shrink-0 text-xs text-slate-600">{formatLabel(item.label)}</div>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <div className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-700">
              {item.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}
