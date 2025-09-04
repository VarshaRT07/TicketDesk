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
  console.log("🚀 Server action called for ticket creation");

  const formData = await request.formData();

  // Extract form data
  const title = formData.get("title") as string;
  const priority = formData.get("priority") as TicketPriority;
  const status = formData.get("status") as TicketStatus;
  const description = formData.get("description") as string;

  console.log("📝 Server action form data:", {
    title: title?.substring(0, 50) + "...",
    priority,
    status,
    descriptionLength: description?.length || 0,
  });

  // Validate required fields
  if (!title?.trim()) {
    console.error("❌ Server validation: Title is required");
    return {
      error: "Title is required",
      success: false,
    };
  }

  if (!description?.trim()) {
    console.error("❌ Server validation: Description is required");
    return {
      error: "Description is required",
      success: false,
    };
  }

  try {
    // For now, we'll use a simple approach to get user ID
    // In a real app, you'd get this from the session/auth header
    // Since server-side auth is complex with your current setup,
    // we'll need to pass the user ID from the client
    const userId = formData.get("userId") as string;

    if (!userId) {
      console.error("❌ Server validation: User ID is required");
      return {
        error: "Authentication required. Please refresh and try again.",
        success: false,
      };
    }

    console.log("💾 Server: Creating ticket in database...");

    // Create the ticket using server-side Supabase client
    const { data: ticket, error: ticketError } = await supabaseServer
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
      console.error("❌ Server: Ticket creation error:", ticketError);
      return {
        error: `Failed to create ticket: ${ticketError.message}`,
        success: false,
      };
    }

    console.log("✅ Server: Ticket created successfully:", ticket.id);

    // Handle file attachments if any
    const files = formData.getAll("attachments") as File[];
    console.log("📎 Server: Processing attachments, count:", files.length);

    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file && file.size > 0) {
          console.log(
            `📎 Server: Uploading file ${i + 1}:`,
            file.name,
            "Size:",
            file.size
          );
          try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${ticket.id}/${Date.now()}-${i}.${fileExt}`;

            // Convert File to ArrayBuffer for server-side upload
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            const { error: uploadError } = await supabaseServer.storage
              .from("ticket-attachments")
              .upload(fileName, uint8Array, {
                contentType: file.type,
              });

            if (uploadError) {
              console.error(
                `❌ Server: File upload error for ${file.name}:`,
                uploadError
              );
              // Don't fail the whole operation for file upload errors
            } else {
              console.log(`✅ Server: File uploaded successfully: ${fileName}`);
            }
          } catch (fileError) {
            console.error(
              `❌ Server: File processing error for ${file.name}:`,
              fileError
            );
          }
        }
      }
    }

    console.log("🎉 Server: Ticket creation completed successfully!");
    console.log("🔄 Server: Redirecting to /tickets...");

    // Redirect to tickets page on success
    throw redirect("/");
  } catch (error) {
    if (error instanceof Response) {
      // This is a redirect, let it through
      throw error;
    }

    console.error("❌ Server: Unexpected error during ticket creation:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      success: false,
    };
  }
}

export default function NewTicketPage() {
  console.log("🎫 NewTicketPage rendered (server-side action version)");

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
