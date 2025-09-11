import { ArrowLeft } from "lucide-react";
import { Link, useLoaderData } from "react-router";
import { AuthGuard } from "~/components/AuthGuard";
import PriorityBadge from "~/components/PriorityBadge";
import StatusBadge from "~/components/StatusBadge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { supabaseServer } from "~/lib/supabaseClient";
import type { Ticket } from "~/lib/types";
import { formatDate, getShortId } from "~/lib/utils";

export function meta({ params }: any) {
  return [
    { title: `Ticket ${params.ticketId} - TicketDesk` },
    { name: "description", content: "View ticket details" },
  ];
}

export async function loader({ params }: any) {
  const { ticketId } = params;

  // Fetch ticket details with creator profile
  const { data: ticket, error: ticketError } = await supabaseServer
    .from("tickets")
    .select(
      `
      *,
      profiles!tickets_created_by_fkey (
        name,
        email
      )
    `
    )
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    throw new Response("Ticket not found", { status: 404 });
  }

  // Transform the data to match our Ticket type
  const transformedTicket: Ticket = {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    created_at: ticket.created_at,
    updated_at: ticket.updated_at,
    created_by: ticket.created_by,
    assigned_to: ticket.assigned_to,
    creator_name: ticket.profiles?.name || "Unknown",
    creator_email: ticket.profiles?.email || "",
    assignee_name: undefined,
    category_id: ticket.category_id,
    tags: ticket.tags || [],
    comments: [],
    attachments: [],
  };

  return {
    ticket: transformedTicket,
  };
}

export default function TicketDetailsPage() {
  const { ticket } = useLoaderData() as { ticket: Ticket };

  return (
    <AuthGuard requireAuth={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/tickets">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {ticket.title}
            </h1>
            <p className="text-muted-foreground">#{getShortId(ticket.id)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ticket Details</CardTitle>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2 text-foreground">
                      Description
                    </h3>
                    <div
                      className="prose prose-sm max-w-none text-foreground"
                      dangerouslySetInnerHTML={{
                        __html:
                          ticket.description || "No description provided.",
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-foreground">
                        Created:
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {formatDate(ticket.created_at)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">
                        Updated:
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {formatDate(ticket.updated_at)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">
                        Created by:
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {ticket.creator_name}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">
                        Assigned to:
                      </span>{" "}
                      {ticket.assignee_name ? (
                        <div className="inline-flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {ticket.assignee_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Support Team
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Information Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    Status:
                  </span>
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    Priority:
                  </span>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-foreground">
                    Assigned to:
                  </span>
                  <div className="text-right">
                    {ticket.assignee_name ? (
                      <div>
                        <div className="text-sm text-foreground">
                          {ticket.assignee_name}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Support Team
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-foreground">
                    Created by:
                  </span>
                  <div className="text-right">
                    <div className="text-sm text-foreground">
                      {ticket.creator_name}
                    </div>
                    {ticket.creator_email && (
                      <div className="text-xs text-muted-foreground">
                        {ticket.creator_email}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
