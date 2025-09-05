import type { Session, User } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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

  // Use refs to track loading states and prevent unnecessary API calls
  const isInitialized = useRef(false);
  const profileCache = useRef<Map<string, Profile>>(new Map());
  const loadingProfile = useRef<string | null>(null);

  // Memoized profile loader with caching
  const loadProfile = useCallback(async (userId: string) => {
    // Prevent duplicate profile loading
    if (loadingProfile.current === userId) {
      return;
    }

    // Check cache first
    const cachedProfile = profileCache.current.get(userId);
    if (cachedProfile) {
      setProfile(cachedProfile);
      return;
    }

    loadingProfile.current = userId;

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
        // Cache the profile
        profileCache.current.set(userId, data);
        setProfile(data);
      }
    } catch (error) {
      console.error("❌ Profile exception:", error);
      setProfile(null);
    } finally {
      loadingProfile.current = null;
    }
  }, []);

  // Optimized session refresh
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Session refresh error:", error);
        setUser(null);
        setProfile(null);
        setSession(null);
        return;
      }

      if (data.session) {
        setUser(data.session.user);
        setSession(data.session);
        await loadProfile(data.session.user.id);
      } else {
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
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    try {
      // Clear state immediately for instant UI feedback
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);

      // Clear profile cache
      profileCache.current.clear();
      loadingProfile.current = null;

      // Call Supabase signOut in background
      await supabase.auth.signOut();
    } catch (error) {
      console.error("❌ Sign out exception:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) {
      return;
    }

    isInitialized.current = true;

    // Initialize client-side authentication
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Initial session error:", error);
          return;
        }

        if (data.session) {
          setUser(data.session.user);
          setSession(data.session);
          await loadProfile(data.session.user.id);
        }
      } catch (error) {
        console.error("❌ Auth initialization exception:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes with optimized handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip processing if we're in the middle of initialization
      if (!isInitialized.current) {
        return;
      }

      // Handle different auth events efficiently
      switch (event) {
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
          if (session) {
            setUser(session.user);
            setSession(session);
            // Only load profile if we don't have it cached or user changed
            if (!profile || profile.id !== session.user.id) {
              await loadProfile(session.user.id);
            }
          }
          setLoading(false);
          break;

        case "SIGNED_OUT":
          setUser(null);
          setProfile(null);
          setSession(null);
          profileCache.current.clear();
          loadingProfile.current = null;
          setLoading(false);
          break;

        case "USER_UPDATED":
          if (session) {
            setUser(session.user);
            setSession(session);
          }
          setLoading(false);
          break;

        default:
          // For other events, just ensure loading is false
          setLoading(false);
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile, profile]);

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
