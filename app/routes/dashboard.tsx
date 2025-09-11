import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { useLoaderData, useNavigate } from "react-router";
import { AuthGuard } from "~/components/AuthGuard";
import DashboardStats from "~/components/DashboardStats";
import TicketCard from "~/components/TicketCard";
import { supabaseServer } from "~/lib/supabaseClient";
import type { Ticket, TicketStats } from "~/lib/types";
import type { Route } from "./+types/dashboard";

export async function loader({}: Route.LoaderArgs) {
  try {
    // Get recent tickets with profile information
    const { data: recentTicketsData, error: ticketsError } =
      await supabaseServer
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
        .order("created_at", { ascending: false })
        .limit(6);

    console.log("📋 Recent tickets query result:", {
      data: recentTicketsData,
      error: ticketsError,
    });

    // Get all tickets for stats
    const { data: allTicketsData, error: statsError } = await supabaseServer
      .from("tickets")
      .select("status, priority, created_at");

    console.log("📊 Stats query result:", {
      data: allTicketsData,
      error: statsError,
    });

    let stats: TicketStats = {
      total: 0,
      open: 0,
      in_progress: 0,
      waiting: 0,
      closed: 0,
    };

    if (allTicketsData && !statsError) {
      stats = {
        total: allTicketsData.length,
        open: allTicketsData.filter((t) => t.status === "open").length,
        in_progress: allTicketsData.filter((t) => t.status === "in_progress")
          .length,
        waiting: allTicketsData.filter((t) => t.status === "waiting").length,
        closed: allTicketsData.filter((t) => t.status === "closed").length,
      };
    } else if (statsError) {
      console.warn("⚠️ Stats query failed:", statsError);
    }

    // Transform tickets data
    const recentTickets: Ticket[] =
      recentTicketsData?.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        created_by: ticket.created_by,
        assigned_to: ticket.assigned_to,
        creator_name: ticket.profiles?.name || "Unknown User",
        creator_email: ticket.profiles?.email || "",
        assignee_name: undefined,
        category_id: undefined,
        tags: [],
        comments: [],
        attachments: [],
      })) || [];

    console.log("✅ Dashboard data loaded successfully:", {
      recentTicketsCount: recentTickets.length,
      stats,
    });

    return {
      recentTickets,
      stats,
    };
  } catch (error) {
    console.error("❌ Dashboard loader unexpected error:", error);
    return {
      recentTickets: [],
      stats: {
        total: 0,
        open: 0,
        in_progress: 0,
        waiting: 0,
        closed: 0,
      },
      error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export default function DashboardPage() {
  const { recentTickets, stats, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const handleCreateTicket = () => {
    navigate("/tickets/new");
  };

  const handleTicketClick = (ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const handleViewAllTickets = () => {
    navigate("/tickets");
  };

  return (
    <AuthGuard>
      <div className="space-y-8">
        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h3 className="font-semibold text-destructive mb-2">
              Dashboard Error
            </h3>
            <p className="text-sm text-destructive/80">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Check the browser console for detailed debugging information.
            </p>
          </div>
        )}

        {/* Dashboard Stats */}
        <DashboardStats
          stats={stats}
          trends={{
            total: { value: 12, isPositive: true },
            open: { value: 8, isPositive: false },
            in_progress: { value: 15, isPositive: true },
            closed: { value: 25, isPositive: true },
          }}
        />

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleCreateTicket}
              className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-slate-600 dark:bg-slate-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Create Ticket</h3>
                <p className="text-sm text-muted-foreground">
                  Submit a new support request
                </p>
              </div>
            </button>

            <button
              onClick={handleViewAllTickets}
              className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">
                  View All Tickets
                </h3>
                <p className="text-sm text-muted-foreground">
                  Browse all support tickets
                </p>
              </div>
            </button>

            <button className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all duration-200 group">
              <div className="w-12 h-12 bg-slate-600 dark:bg-slate-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  View performance metrics
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              Recent Tickets
            </h2>
            <button
              onClick={handleViewAllTickets}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View All →
            </button>
          </div>

          {recentTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => handleTicketClick(ticket)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No tickets yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first support ticket
              </p>
              <button
                onClick={handleCreateTicket}
                className="px-6 py-3 bg-slate-600 dark:bg-slate-500 hover:bg-slate-700 dark:hover:bg-slate-400 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Create Your First Ticket
              </button>
            </div>
          )}
        </div>

        {/* Activity Summary */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Activity Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {stats.open}
              </h3>
              <p className="text-sm text-muted-foreground">Open Tickets</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {stats.in_progress}
              </h3>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {stats.closed}
              </h3>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {stats.total}
              </h3>
              <p className="text-sm text-muted-foreground">Total Tickets</p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
