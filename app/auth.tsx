import type { Session, User } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

type Profile = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Profile error:", error);
        setProfile(null);
      } else {
        console.log("✅ Profile loaded:", data.name);
        setProfile(data);
      }
    } catch (error) {
      console.error("❌ Profile exception:", error);
      setProfile(null);
    }
  };

  const refreshSession = async () => {
    try {
      console.log("🔄 Refreshing session...");
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Session refresh error:", error);
        setUser(null);
        setProfile(null);
        setSession(null);
        return;
      }

      if (data.session) {
        console.log("✅ Session refreshed:", data.session.user.email);
        setUser(data.session.user);
        setSession(data.session);
        await loadProfile(data.session.user.id);
      } else {
        console.log("❌ No session found");
        setUser(null);
        setProfile(null);
        setSession(null);
      }
    } catch (error) {
      console.error("❌ Session refresh exception:", error);
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  };

  const signOut = async () => {
    try {
      console.log("👋 Signing out...");

      // Clear state immediately for instant UI feedback
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false); // Important: Set loading to false so AuthGuard doesn't show spinner

      // Call Supabase signOut in background - don't wait for it
      supabase.auth.signOut().catch((error) => {
        console.error("❌ Background sign out error:", error);
      });

      console.log("✅ Signed out successfully");
    } catch (error) {
      console.error("❌ Sign out exception:", error);
      // Even on error, ensure loading is false
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize client-side authentication
    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing auth...");
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Initial session error:", error);
          setLoading(false);
          return;
        }

        if (data.session) {
          console.log("✅ Initial session found:", data.session.user.email);
          setUser(data.session.user);
          setSession(data.session);
          await loadProfile(data.session.user.id);
        } else {
          console.log("❌ No initial session");
        }
      } catch (error) {
        console.error("❌ Auth initialization exception:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.email);

      if (session && event !== "SIGNED_OUT") {
        // Only load profile when signing in or token refresh, not when signing out
        setUser(session.user);
        setSession(session);
        await loadProfile(session.user.id);
        setLoading(false); // Ensure loading is false after successful auth
      } else {
        // Clear state for sign out or no session
        setUser(null);
        setProfile(null);
        setSession(null);
        setLoading(false); // Ensure loading is false when signed out
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    session,
    loading,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
