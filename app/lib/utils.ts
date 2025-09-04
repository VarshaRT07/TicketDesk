import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { priorityConfig, statusConfig } from "./constants";
import type { AppError, Ticket, TicketPriority, TicketStatus } from "./types";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

/**
 * Format a date string to a relative time format (e.g., "2h ago", "3d ago")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "Unknown time";
  }
}

/**
 * Truncate a string to a specified length and add ellipsis
 */
export function truncateString(str: string, length: number): string {
  if (!str || typeof str !== "string") return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Generate a short ID from a full UUID (first 8 characters)
 */
export function getShortId(id: string): string {
  if (!id || typeof id !== "string") return "";
  return id.slice(0, 8);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Check if a file type is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Validate file size against maximum allowed size
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Get status configuration with fallback
 */
export function getStatusInfo(status: TicketStatus) {
  return statusConfig[status] || statusConfig.open;
}

/**
 * Get priority configuration with fallback
 */
export function getPriorityInfo(priority: TicketPriority) {
  return priorityConfig[priority] || priorityConfig.medium;
}

/**
 * Sort tickets by priority (critical first) and then by creation date
 */
export function sortTicketsByPriority(tickets: Ticket[]): Ticket[] {
  return [...tickets].sort((a, b) => {
    const priorityA = getPriorityInfo(a.priority).weight;
    const priorityB = getPriorityInfo(b.priority).weight;

    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }

    // If same priority, sort by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/**
 * Filter tickets based on search criteria
 */
export function filterTickets(
  tickets: Ticket[],
  filters: {
    status?: string;
    priority?: string;
    search?: string;
  }
): Ticket[] {
  return tickets.filter((ticket) => {
    // Status filter
    if (
      filters.status &&
      filters.status !== "all" &&
      ticket.status !== filters.status
    ) {
      return false;
    }

    // Priority filter
    if (
      filters.priority &&
      filters.priority !== "all" &&
      ticket.priority !== filters.priority
    ) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = ticket.title.toLowerCase().includes(searchLower);
      const descriptionMatch = ticket.description
        .toLowerCase()
        .includes(searchLower);
      const idMatch = ticket.id.toLowerCase().includes(searchLower);

      if (!titleMatch && !descriptionMatch && !idMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Create an error object with consistent structure
 */
export function createError(
  message: string,
  code?: string,
  details?: unknown
): AppError {
  return {
    message,
    code,
    details,
  };
}

/**
 * Handle async operations with error catching
 */
export async function handleAsync<T>(
  promise: Promise<T>
): Promise<[T | null, AppError | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    const appError = createError(
      error instanceof Error ? error.message : "An unknown error occurred",
      "ASYNC_ERROR",
      error
    );
    return [null, appError];
  }
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate a random ID (for temporary use)
 */
export function generateTempId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}
