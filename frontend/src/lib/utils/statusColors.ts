type ColorKey = "gray" | "blue" | "yellow" | "green" | "red" | "purple";

const COLOR_CLASSES: Record<ColorKey, string> = {
  gray: "bg-gray-100 text-gray-700 ring-gray-200",
  blue: "bg-brand-mist/25 text-slate-700 ring-brand-mist/60",
  yellow: "bg-yellow-50 text-yellow-800 ring-yellow-200",
  green: "bg-brand-50 text-brand-700 ring-brand-100",
  red: "bg-red-50 text-red-700 ring-red-200",
  purple: "bg-brand-slate/15 text-slate-700 ring-brand-slate/40",
};

const STATUS_COLOR: Record<string, ColorKey> = {
  new: "blue",
  submitted: "blue",
  draft: "gray",
  in_progress: "yellow",
  investigating: "yellow",
  on_hold: "yellow",
  root_cause_identified: "yellow",
  approved: "blue",
  resolved: "green",
  implemented: "green",
  fulfilled: "green",
  published: "green",
  closed: "gray",
  archived: "gray",
  rejected: "red",
};

const PRIORITY_COLOR: Record<string, ColorKey> = {
  low: "gray",
  medium: "blue",
  high: "yellow",
  critical: "red",
};

export function statusClass(status: string): string {
  return COLOR_CLASSES[STATUS_COLOR[status] ?? "gray"];
}

export function priorityClass(priority: string): string {
  return COLOR_CLASSES[PRIORITY_COLOR[priority] ?? "gray"];
}
