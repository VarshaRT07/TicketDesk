import {
  Bell,
  Filter,
  LogOut,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/auth";
import { Button } from "./ui/button";

interface NavbarProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onCreateTicket?: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function Navbar({
  title = "Dashboard",
  subtitle,
  showSearch = true,
  onSearch,
  onFilter,
  darkMode = false,
  onToggleDarkMode,
  onCreateTicket,
  sidebarOpen = true,
  onToggleSidebar,
}: NavbarProps) {
  const { user, profile, signOut, loading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log("🚪 Signing out...");
      setSigningOut(true);
      navigate("/login");
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Sidebar Toggle and Title */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle Button */}
            <Button
              onClick={onToggleSidebar}
              variant="ghost"
              size="sm"
              className="p-2.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeftOpen className="w-5 h-5" />
              )}
            </Button>

            {/* Title and Subtitle */}
            <div>
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Center - Search */}
          {showSearch && user && (
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tickets, users, or content..."
                  onChange={(e) => onSearch?.(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Right side - Actions and User */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Create Ticket Button */}
                {onCreateTicket && (
                  <Button
                    onClick={onCreateTicket}
                    size="sm"
                    className="hidden sm:flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Ticket</span>
                  </Button>
                )}

                {/* Filter Button */}
                {onFilter && (
                  <Button
                    onClick={onFilter}
                    variant="ghost"
                    size="sm"
                    className="p-2.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                )}

                {/* Dark Mode Toggle */}
                {onToggleDarkMode && (
                  <Button
                    onClick={onToggleDarkMode}
                    variant="ghost"
                    size="sm"
                    className="p-2.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {darkMode ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </Button>
                )}

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
                    <span className="text-xs text-destructive-foreground font-bold">
                      3
                    </span>
                  </span>
                </Button>

                {/* Settings */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </Button>

                {/* User Menu */}
                <div className="relative">
                  <Button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    variant="ghost"
                    className="flex items-center space-x-3 p-2 hover:bg-muted rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-primary-foreground">
                        {profile?.name?.charAt(0)?.toUpperCase() ||
                          user.email?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-foreground">
                        {profile?.name || user.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.role || "Member"}
                      </p>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </Button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-2 z-50">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground">
                          {profile?.name || user.email?.split("@")[0] || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-2">
                        <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </button>
                        <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                      </div>

                      <div className="border-t border-border pt-2">
                        <button
                          onClick={handleSignOut}
                          disabled={signingOut}
                          className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>
                            {signingOut ? "Signing Out..." : "Sign Out"}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}
