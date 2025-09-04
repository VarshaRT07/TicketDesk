import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable");
}

console.log("🔧 Supabase config:", {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
});

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable automatic token refresh
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session from URL on redirect
    detectSessionInUrl: true,
    // Storage key for session
    storageKey: "supabase.auth.token",
    // Faster signOut by not waiting for server confirmation
    flowType: "pkce",
  },
});

// Server-side Supabase client for loaders (without auth)
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Log client creation
console.log("✅ Supabase client created successfully");
