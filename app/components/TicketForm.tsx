import { AlertCircle } from "lucide-react";
import * as React from "react";
import { Form, useActionData, useNavigation } from "react-router";
import { useAuth } from "~/auth";
import {
  defaultTicketValues,
  getPriorityConfig,
  getStatusConfig,
  priorityOptions,
  statusOptions,
} from "~/lib/constants";
import type { FormState, TicketPriority, TicketStatus } from "~/lib/types";
import { AttachmentsDropzone } from "./AttachmentsDropZone";
import { RichTextEditor } from "./RichTextEditor";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

export function TicketForm() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const actionData = useActionData() as
    | { error?: string; success?: boolean }
    | undefined;

  const [files, setFiles] = React.useState<File[]>([]);
  const [state, setState] = React.useState<FormState>({
    title: defaultTicketValues.title,
    priority: defaultTicketValues.priority,
    status: defaultTicketValues.status,
    description: defaultTicketValues.description,
  });

  const formRef = React.useRef<HTMLFormElement>(null);
  const isSubmitting = navigation.state === "submitting";

  React.useEffect(() => {
    if (actionData?.success) {
      setState({
        title: defaultTicketValues.title,
        priority: defaultTicketValues.priority,
        status: defaultTicketValues.status,
        description: defaultTicketValues.description,
      });
      setFiles([]);
      formRef.current?.reset();
    }
  }, [actionData?.success]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    const form = event.currentTarget;
    form.submit();
  };

  const handleReset = () => {
    setState({
      title: defaultTicketValues.title,
      priority: defaultTicketValues.priority,
      status: defaultTicketValues.status,
      description: defaultTicketValues.description,
    });
    setFiles([]);
    formRef.current?.reset();
  };

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>You must be logged in to create a ticket.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {actionData?.error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{actionData.error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <Form
            ref={formRef}
            method="post"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Hidden fields */}
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="description" value={state.description} />

            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Title *
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Brief description of the issue"
                value={state.title}
                onChange={(e) =>
                  setState((s) => ({ ...s, title: e.target.value }))
                }
                disabled={isSubmitting}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label
                htmlFor="priority"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Priority *
              </label>
              <select
                name="priority"
                value={state.priority}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    priority: e.target.value as TicketPriority,
                  }))
                }
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {priorityOptions.map((priority) => {
                  const config = getPriorityConfig(priority);
                  return (
                    <option key={priority} value={priority}>
                      {config.label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label
                htmlFor="status"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Status *
              </label>
              <select
                name="status"
                value={state.status}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    status: e.target.value as TicketStatus,
                  }))
                }
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {statusOptions.map((status) => {
                  const config = getStatusConfig(status);
                  return (
                    <option key={status} value={status}>
                      {config.label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Description *
              </label>
              <RichTextEditor
                value={state.description}
                onChange={(html) =>
                  setState((s) => ({ ...s, description: html }))
                }
                placeholder="Provide detailed information about the issue..."
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset Form
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !state.title.trim() ||
                    !state.description.trim()
                  }
                >
                  {isSubmitting ? "Creating..." : "Create Ticket"}
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
