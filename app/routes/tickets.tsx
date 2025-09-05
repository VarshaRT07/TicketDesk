import { AlertCircle, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { AuthGuard } from "~/components/AuthGuard";
import { TicketCard } from "~/components/TicketCard";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { supabaseServer } from "~/lib/supabaseClient";
import type { Ticket, TicketStats } from "~/lib/types";
import type { Route } from "./+types/tickets";

export async function loader({ request }: Route.LoaderArgs) {
  // Parse URL parameters for filtering
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status") || "all";
  const priorityFilter = url.searchParams.get("priority") || "all";
  const searchFilter = url.searchParams.get("search") || "";

  try {
    // Build query for tickets
    let query = supabaseServer
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

    if (ticketsError) {
      console.error("Error loading tickets:", ticketsError);
      return {
        tickets: [],
        stats: { total: 0, open: 0, in_progress: 0, closed: 0 },
        filters: {
          status: statusFilter,
          priority: priorityFilter,
          search: searchFilter,
        },
        error: ticketsError.message,
      };
    }

    // Get ticket counts for stats - use a more efficient query
    const { data: statsData, error: statsError } = await supabaseServer
      .from("tickets")
      .select("status", { count: "exact" });

    let stats: TicketStats = {
      total: 0,
      open: 0,
      in_progress: 0,
      waiting: 0,
      closed: 0,
    };

    if (!statsError && statsData) {
      stats = {
        total: statsData.length,
        open: statsData.filter((t) => t.status === "open").length,
        in_progress: statsData.filter((t) => t.status === "in_progress").length,
        waiting: statsData.filter((t) => t.status === "waiting").length,
        closed: statsData.filter((t) => t.status === "closed").length,
      };
    }

    // Type the tickets data properly
    const tickets: Ticket[] = (ticketsData || []).map((ticket: any) => ({
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
    }));

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
    console.error("Unexpected error in loader:", error);
    return {
      tickets: [],
      stats: { total: 0, open: 0, in_progress: 0, closed: 0 },
      filters: {
        status: statusFilter,
        priority: priorityFilter,
        search: searchFilter,
      },
      error: "An unexpected error occurred while loading tickets.",
    };
  }
}

export default function TicketsPage() {
  const {
    tickets,
    stats,
    filters,
    error: loaderError,
  } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set("search", searchInput.trim());
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="space-y-6 mx-20 my-8">
        {/* Error Message */}
        {loaderError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{loaderError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground">
              Manage and track customer support requests
            </p>
          </div>
          <Button asChild>
            <Link to="/tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Open</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.open}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.in_progress}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Closed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.closed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </form>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {filters.search ||
                  filters.status !== "all" ||
                  filters.priority !== "all"
                    ? "No tickets match your current filters."
                    : "No tickets found. Create your first ticket to get started."}
                </p>
                {!filters.search &&
                  filters.status === "all" &&
                  filters.priority === "all" && (
                    <Button asChild className="mt-4">
                      <Link to="/tickets/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Ticket
                      </Link>
                    </Button>
                  )}
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
