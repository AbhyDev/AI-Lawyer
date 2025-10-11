import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Scale, LayoutDashboard, FileText, Upload, Brain, BarChart3, Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  role?: "lawyer" | "judge" | "citizen";
  pageTitle?: string;
}

const AppLayout = ({ children, role = "lawyer", pageTitle }: AppLayoutProps) => {
  const location = useLocation();
  
  const navigation = [
    { name: "Dashboard", href: `/dashboard/${role}`, icon: LayoutDashboard },
    { name: "Cases", href: "/cases", icon: FileText },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "AI Counsel", href: "/aicounsel", icon: Brain },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Alerts", href: "/alerts", icon: Bell },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="flex h-16 items-center px-6">
          <Link to="/" className="flex items-center gap-3 mr-8">
            <div className="h-10 w-10 rounded-lg bg-gradient-accent flex items-center justify-center shadow-md">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">UDAAN</h1>
              <p className="text-xs text-muted-foreground capitalize">{role} Portal</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <Button variant="ghost" size="icon" title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-border">
          <nav className="flex overflow-x-auto scrollbar-hide px-4 py-2 gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Page Title */}
      {pageTitle && (
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{pageTitle}</h1>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 custom-scrollbar">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
