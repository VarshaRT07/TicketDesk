import type { PriorityBadgeProps } from "~/lib/types";
import { cn, getPriorityInfo } from "~/lib/utils";
import { Badge } from "./ui/badge";

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityInfo = getPriorityInfo(priority);

  return (
    <Badge variant="outline" className={cn(priorityInfo.color, className)}>
      {priorityInfo.label}
    </Badge>
  );
}
