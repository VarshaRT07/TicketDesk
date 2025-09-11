import { useState } from "react";
import { useNavigate } from "react-router";
import { AuthGuard } from "~/components/AuthGuard";
import TicketForm from "~/components/TicketForm";
import { supabaseServer } from "~/lib/supabaseClient";
import type { TicketFormData } from "~/lib/types";
import type { Route } from "./+types/newtickets";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  try {
    const ticketData: Partial<TicketFormData> = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priority: formData.get("priority") as
        | "low"
        | "medium"
        | "high"
        | "critical",
      status: "open", // Default status for new tickets
    };

    console.log("🎫 Creating new ticket:", ticketData);

    // Insert the ticket into the database
    const { data: newTicket, error } = await supabaseServer
      .from("tickets")
      .insert([
        {
          title: ticketData.title,
          description: ticketData.description,
          priority: ticketData.priority,
          status: ticketData.status,
          created_by: null, // Will be set by RLS or trigger
          assigned_to: null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to create ticket:", error);
      return {
        success: false,
        error: `Failed to create ticket: ${error.message}`,
      };
    }

    console.log("✅ Ticket created successfully:", newTicket);

    return {
      success: true,
      ticketId: newTicket.id,
    };
  } catch (error) {
    console.error("❌ Unexpected error creating ticket:", error);
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export default function NewTicketPage({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (ticketData: TicketFormData) => {
    try {
      setError(null);
      console.log("📝 Submitting ticket form:", ticketData);

      // Create FormData for the action
      const formData = new FormData();
      formData.append("title", ticketData.title);
      formData.append("description", ticketData.description || "");
      formData.append("priority", ticketData.priority);

      // Submit using fetch to trigger the action
      const response = await fetch("/tickets/new", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Ticket created, redirecting...");
        navigate(`/tickets/${result.ticketId}`);
      } else {
        setError(result.error || "Failed to create ticket");
      }
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Create New Ticket
          </h1>
          <p className="text-muted-foreground">
            Submit a new support request and we'll get back to you as soon as
            possible.
          </p>
        </div>

        {/* Error Display */}
        {(error || (actionData && !actionData.success)) && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h3 className="font-semibold text-destructive mb-2">
              Error Creating Ticket
            </h3>
            <p className="text-sm text-destructive/80">
              {error || actionData?.error || "Failed to create ticket"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Check the browser console for detailed debugging information.
            </p>
          </div>
        )}

        {/* Success Display */}
        {actionData && actionData.success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              Ticket Created Successfully!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your ticket has been created and assigned ID:{" "}
              {actionData.ticketId}
            </p>
          </div>
        )}

        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <TicketForm onSubmit={handleSubmit} isEditing={false} />
        </div>
      </div>
    </AuthGuard>
  );
}
