import { AlertTriangle, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { priorityConfig } from "../lib/constants";
import type { TicketPriority } from "../lib/types";

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

const priorityIcons = {
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  critical: AlertTriangle,
};

const priorityStyles = {
  low: "bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600/50",
  medium:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50",
  high: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700/50",
  critical:
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/50",
};

export default function PriorityBadge({
  priority,
  className = "",
}: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  const Icon = priorityIcons[priority];

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${priorityStyles[priority]} ${className}`}
    >
      <Icon className="w-3 h-3 mr-1.5" />
      {config.label}
    </span>
  );
}
