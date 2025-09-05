import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/auth";
import { LoadingFallback } from "./LoadingComponents";

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

  const authState = useMemo(
    () => ({
      isAuthenticated: !!user,
      loading,
      shouldRedirect:
        !loading && ((requireAuth && !user) || (!requireAuth && user)),
      redirectPath: requireAuth && !user ? redirectTo : "/",
    }),
    [user, loading, requireAuth, redirectTo]
  );

  useEffect(() => {
    if (authState.shouldRedirect) {
      navigate(authState.redirectPath);
    }
  }, [authState.shouldRedirect, authState.redirectPath, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingFallback message="Authenticating..." />
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}
