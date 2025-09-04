import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function AuthGuard({
  children,
  redirectTo = "/login",
  requireAuth = true,
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log("🛡️ AuthGuard state:", {
      user: !!user,
      loading,
      requireAuth,
      redirectTo,
    });
  }, [user, loading, requireAuth, redirectTo]);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        console.log("🔄 AuthGuard: Redirecting to", redirectTo, "(no user)");
        navigate(redirectTo);
      } else if (!requireAuth && user) {
        console.log("🔄 AuthGuard: Redirecting to / (user exists)");
        navigate("/");
      }
    }
  }, [user, loading, navigate, redirectTo, requireAuth]);

  if (loading) {
    console.log("⏳ AuthGuard: Showing loading spinner");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    console.log("🚫 AuthGuard: Blocking render (requireAuth=true, no user)");
    return null; // Will redirect via useEffect
  }

  if (!requireAuth && user) {
    console.log(
      "🚫 AuthGuard: Blocking render (requireAuth=false, user exists)"
    );
    return null; // Will redirect via useEffect
  }

  console.log("✅ AuthGuard: Rendering children");
  return <>{children}</>;
}
