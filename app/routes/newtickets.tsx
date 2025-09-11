import { useState } from "react";
import { useNavigate } from "react-router";
import { AuthGuard } from "~/components/AuthGuard";
import TicketForm from "~/components/TicketForm";
import { supabase } from "~/lib/supabaseClient";
import type { TicketFormData } from "~/lib/types";

export default function NewTicketPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (formData: TicketFormData) => {
    console.log(formData, "FormData");
    try {
      setError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to create a ticket");
      }

      // Insert the ticket
      const { data, error } = await supabase
        .from("tickets")
        .insert({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          assigned_to: formData.assigned_to,
          tags: formData.tags,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Redirect to the new ticket
      navigate(`/tickets/${data.id}`);
    } catch (err) {
      console.error("Error creating ticket:", err);
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Create New Ticket
          </h1>
          <p className="text-muted-foreground">
            Submit a new support request and we'll get back to you as soon as
            possible.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* Ticket Form */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <TicketForm onSubmit={handleSubmit} />
        </div>
      </div>
    </AuthGuard>
  );
}
