import { Badge } from "@/components/ui/Badge";
import { formatLabel } from "@/lib/utils/format";
import { priorityClass, statusClass } from "@/lib/utils/statusColors";

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={statusClass(status)}>{formatLabel(status)}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <Badge className={priorityClass(priority)}>{formatLabel(priority)}</Badge>;
}
