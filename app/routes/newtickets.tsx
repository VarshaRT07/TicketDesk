import { ArrowLeft } from "lucide-react";
import { Link, redirect } from "react-router";
import { AuthGuard } from "~/components/AuthGuard";
import { TicketForm } from "~/components/TicketForm";
import { Button } from "~/components/ui/button";
import { supabaseServer } from "~/lib/supabaseClient";
import type { TicketPriority, TicketStatus } from "~/lib/types";
import type { Route } from "./+types/newtickets";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New Ticket - TicketDesk" },
    { name: "description", content: "Create a new support ticket" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const title = formData.get("title") as string;
  const priority = formData.get("priority") as TicketPriority;
  const status = formData.get("status") as TicketStatus;
  const description = formData.get("description") as string;

  if (!title?.trim()) {
    return {
      error: "Title is required",
      success: false,
    };
  }

  if (!description?.trim()) {
    return {
      error: "Description is required",
      success: false,
    };
  }

  try {
    const userId = formData.get("userId") as string;

    const { error: ticketError } = await supabaseServer
      .from("tickets")
      .insert({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        created_by: userId,
      })
      .select()
      .single();

    if (ticketError) {
      return {
        error: `Failed to create ticket: ${ticketError.message}`,
        success: false,
      };
    }
    throw redirect("/");
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      success: false,
    };
  }
}

export default function NewTicketPage() {
  return (
    <AuthGuard requireAuth={true}>
      <Button variant="ghost" asChild>
        <Link to="/">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tickets
        </Link>
      </Button>
      <TicketForm />
    </AuthGuard>
  );
}
