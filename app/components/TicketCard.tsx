import { Link } from "react-router";
import type { TicketCardProps } from "~/lib/types";
import { cn, formatDate, getShortId, truncateString } from "~/lib/utils";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { Card, CardContent } from "./ui/card";

export function TicketCard({ ticket, className }: TicketCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <Link
          to={`/tickets/${ticket.id}`}
          className="block space-y-3 hover:no-underline"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-none tracking-tight">
                {ticket.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                #{getShortId(ticket.id)}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {truncateString(
              ticket.description?.replace(/<[^>]*>/g, "") ||
                "No description provided.",
              150
            )}
          </p>

          <div className="flex items-center text-xs text-muted-foreground gap-4">
            <span>Created {formatDate(ticket.created_at)}</span>
            {ticket.creator_name && <span>by {ticket.creator_name}</span>}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
