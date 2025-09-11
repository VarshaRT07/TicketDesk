import { Grid, List, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { AuthGuard } from "~/components/AuthGuard";
import TicketCard from "~/components/TicketCard";
import TicketTable from "~/components/TicketTable";
import { supabase, supabaseServer } from "~/lib/supabaseClient";
import type { Ticket } from "~/lib/types";
import type { Route } from "./+types/tickets";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status") || "all";
  const priorityFilter = url.searchParams.get("priority") || "all";
  const searchFilter = url.searchParams.get("search") || "";

  try {
    // Build the main query with proper foreign key reference
    let query = supabase
      .from("tickets")
      .select(
        `
        id,
        title,
        description,
        status,
        priority,
        created_at,
        updated_at,
        created_by,
        assigned_to,
        profiles!tickets_created_by_fkey (
          name,
          email
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    if (priorityFilter !== "all") {
      query = query.eq("priority", priorityFilter);
    }

    if (searchFilter) {
      query = query.or(
        `title.ilike.%${searchFilter}%,description.ilike.%${searchFilter}%`
      );
    }

    const { data: ticketsData, error: ticketsError } = await query;
    console.log("📋 Tickets Query Result:", {
      data: ticketsData,
      error: ticketsError,
    });

    // Get all tickets for stats (without filters)
    const { data: statsData, error: statsError } = await supabaseServer
      .from("tickets")
      .select("status");

    console.log("📊 Stats Query Result:", {
      data: statsData,
      error: statsError,
    });

    let stats = {
      total: statsData?.length || 0,
      open: statsData?.filter((t) => t.status === "open").length || 0,
      in_progress:
        statsData?.filter((t) => t.status === "in_progress").length || 0,
      waiting: statsData?.filter((t) => t.status === "waiting").length || 0,
      closed: statsData?.filter((t) => t.status === "closed").length || 0,
    };

    // Transform tickets data
    const tickets: Ticket[] =
      ticketsData?.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        created_by: ticket.created_by,
        assigned_to: ticket.assigned_to,
        // Prefer profiles data when available, fall back to top-level fields, then sensible defaults
        creator_name:
          ticket.profiles?.name ?? ticket.creator_name ?? "Unknown User",
        creator_email: ticket.profiles?.email ?? ticket.creator_email ?? "",
        // Derive assignee name from possible shapes: nested object, top-level field, or raw id/string
        assignee_name:
          ticket.assigned_to?.name ??
          ticket.assignee_name ??
          (typeof ticket.assigned_to === "string"
            ? ticket.assigned_to
            : undefined),
        category_id: ticket.category_id ?? undefined,
        // Preserve any existing arrays from the payload, otherwise default to empty arrays
        tags: ticket.tags ?? [],
        comments: ticket.comments ?? [],
        attachments: ticket.attachments ?? [],
      })) || [];

    console.log("✅ Final Result:", { ticketCount: tickets.length, stats });

    return {
      tickets,
      stats,
      filters: {
        status: statusFilter,
        priority: priorityFilter,
        search: searchFilter,
      },
    };
  } catch (error) {
    console.error("❌ Unexpected error in tickets loader:", error);
    return {
      tickets: [],
      stats: { total: 0, open: 0, in_progress: 0, waiting: 0, closed: 0 },
      filters: {
        status: statusFilter,
        priority: priorityFilter,
        search: searchFilter,
      },
      error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export default function TicketsPage({ loaderData }: Route.ComponentProps) {
  const { tickets, stats, filters, error } = loaderData;
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleCreateTicket = () => {
    navigate("/tickets/new");
  };

  const handleTicketClick = (ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const handleEditTicket = (ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}/edit`);
  };

  const handleDeleteTicket = (ticket: Ticket) => {
    // TODO: Implement delete functionality
    console.log("Delete ticket:", ticket.id);
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h3 className="font-semibold text-destructive mb-2">
              Connection Error
            </h3>
            <p className="text-sm text-destructive/80">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Check the browser console for detailed debugging information.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Tickets</h1>
            <p className="text-muted-foreground">
              Manage and track all support tickets
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Create Ticket Button */}
            <button
              onClick={handleCreateTicket}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Ticket</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-foreground">
              {stats.total}
            </div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-orange-600">
              {stats.open}
            </div>
            <div className="text-sm text-muted-foreground">Open</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.in_progress}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.waiting}
            </div>
            <div className="text-sm text-muted-foreground">Waiting</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.closed}
            </div>
            <div className="text-sm text-muted-foreground">Closed</div>
          </div>
        </div>

        {/* Tickets Content */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          {tickets.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Tickets ({tickets.length})
                </h2>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {tickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onClick={() => handleTicketClick(ticket)}
                    />
                  ))}
                </div>
              ) : (
                <TicketTable
                  tickets={tickets}
                  onTicketClick={handleTicketClick}
                  onEdit={handleEditTicket}
                  onDelete={handleDeleteTicket}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-lg flex items-center justify-center">
                <Grid className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No tickets found
              </h3>
              <p className="text-muted-foreground mb-6">
                {filters.search ||
                filters.status !== "all" ||
                filters.priority !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first support ticket"}
              </p>
              <button
                onClick={handleCreateTicket}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Ticket</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
