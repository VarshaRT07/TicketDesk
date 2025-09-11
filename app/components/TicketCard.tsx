import { Clock, MessageCircle, Paperclip, User } from "lucide-react";
import type { Ticket } from "~/lib/types";
import { formatDate, getShortId, truncateString } from "../lib/utils";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  className?: string;
}

export default function TicketCard({
  ticket,
  onClick,
  className = "",
}: TicketCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-2xl border border-border p-6 hover:shadow-xl hover:border-border/80 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {ticket.title}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-lg">
              #{getShortId(ticket.id)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-6 line-clamp-3 leading-relaxed">
        {truncateString(
          ticket.description?.replace(/<[^>]*>/g, "") ||
            "No description provided.",
          120
        )}
      </p>

      {/* Tags (if available) */}
      {ticket.tags && ticket.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {ticket.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg"
            >
              {tag}
            </span>
          ))}
          {ticket.tags.length > 3 && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-lg">
              +{ticket.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span className="font-medium">{formatDate(ticket.created_at)}</span>
          </div>
          {ticket.creator_name && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span className="font-medium">{ticket.creator_name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Comments count */}
          <div className="flex items-center space-x-1 text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium">
              {ticket.comments?.length || 0}
            </span>
          </div>

          {/* Attachments count */}
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Paperclip className="w-4 h-4" />
            <span className="text-xs font-medium">
              {ticket.attachments?.length || 0}
            </span>
          </div>

          {/* Assignee */}
          {ticket.assignee_name && (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-primary-foreground">
                  {ticket.assignee_name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
