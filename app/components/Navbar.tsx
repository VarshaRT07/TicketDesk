import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/auth";
import { Button } from "./ui/button";

export function Navbar() {
  const { user, profile, signOut, loading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log("🚪 Signing out...");
      setSigningOut(true);

      // Navigate immediately for better UX
      navigate("/login");

      // Then sign out
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <nav className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">TicketDesk</h1>
            </div>
            <div className="flex items-center">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-card border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xl font-semibold hover:text-primary transition-colors">
              TicketDesk
            </Link>
            
            {/* Demo Link */}
            <Button asChild variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700">
              <Link to="/demo/error-boundary" className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Error Demo
              </Link>
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="text-sm text-muted-foreground">
                  Welcome, {profile?.name || user.email}
                </div>
                <Button 
                  onClick={handleSignOut} 
                  variant="outline" 
                  size="sm"
                  disabled={signingOut}
                >
                  {signingOut ? "Signing Out..." : "Sign Out"}
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}