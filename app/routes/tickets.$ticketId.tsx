import { ArrowLeft } from "lucide-react";
import { Link, useLoaderData } from "react-router";
import { AuthGuard } from "~/components/AuthGuard";
import { PriorityBadge } from "~/components/PriorityBadge";
import { StatusBadge } from "~/components/StatusBadge";
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

  // Fetch ticket details with creator and assignee profiles
  const { data: ticket, error: ticketError } = await supabaseServer
    .from("tickets")
    .select(
      `
      *,
      creator:created_by(name, email),
      assignee:assigned_to(name, email)
    `
    )
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    throw new Response("Ticket not found", { status: 404 });
  }

  return {
    ticket,
  };
}

export default function TicketDetailsPage() {
  const { ticket } = useLoaderData() as { ticket: Ticket };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tickets
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{ticket.title}</h1>
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
                      <h3 className="font-medium mb-2">Description</h3>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html:
                            ticket.description || "No description provided.",
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Created:</span>{" "}
                        {formatDate(ticket.created_at)}
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span>{" "}
                        {formatDate(ticket.updated_at)}
                      </div>
                      <div>
                        <span className="font-medium">Created by:</span>{" "}
                        {ticket.creator?.name || "Unknown"}
                      </div>
                      <div>
                        <span className="font-medium">Assigned to:</span>{" "}
                        {ticket.assignee ? (
                          <div className="inline-flex items-center gap-2">
                            <span>{ticket.assignee.name}</span>
                            <span className="text-sm text-muted-foreground">
                              ({ticket.assignee.email})
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
                    <span className="text-sm font-medium">Status:</span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Priority:</span>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">Assigned to:</span>
                    <div className="text-right">
                      {ticket.assignee ? (
                        <div>
                          <div className="text-sm">{ticket.assignee.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {ticket.assignee.email}
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
                    <span className="text-sm font-medium">Created by:</span>
                    <div className="text-right">
                      <div className="text-sm">
                        {ticket.creator?.name || "Unknown"}
                      </div>
                      {ticket.creator?.email && (
                        <div className="text-xs text-muted-foreground">
                          {ticket.creator.email}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
