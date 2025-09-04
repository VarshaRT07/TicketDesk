import { priorityConfig, statusConfig } from "./constants";

// Base types
export type TicketStatus = keyof typeof statusConfig;
export type TicketPriority = keyof typeof priorityConfig;

// Database types
export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to: string | null;
  creator?: Profile;
  assignee?: Profile;
  creator_name?: string;
  creator_email?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  waiting: number;
  closed: number;
}

// Form types
export interface TicketFormData {
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  userId: string;
  attachments?: File[];
}

export interface FormState {
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface LoaderData<T> {
  data: T;
  error?: string;
}

// Filter types
export interface TicketFilters {
  status: string;
  priority: string;
  search: string;
}

// Component prop types
export interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

export interface TicketCardProps {
  ticket: Ticket;
  className?: string;
}

// Attachment types
export interface AttachmentFile extends File {
  preview?: string;
}

export interface AttachmentsDropzoneProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  accept?: string[];
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

// Auth types
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error?: string;
}
