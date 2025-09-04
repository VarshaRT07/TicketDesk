import type { StatusBadgeProps } from "~/lib/types";
import { cn, getStatusInfo } from "~/lib/utils";
import { Badge } from "./ui/badge";

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusInfo = getStatusInfo(status);
  const Icon = statusInfo.icon;

  return (
    <Badge variant="secondary" className={cn(statusInfo.color, className)}>
      <Icon className="w-3 h-3 mr-1" />
      {statusInfo.label}
    </Badge>
  );
}
