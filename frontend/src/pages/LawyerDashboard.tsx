import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Scale,
  FileText,
  Upload,
  MessageSquare,
  Bell,
  Settings,
  LayoutDashboard,
  Search,
  Clock,
  AlertCircle,
  Calendar,
  FolderOpen,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { FloatingChatbot } from "@/components/FloatingChatbot";
import { fetchCases, fetchAnalytics, type Case } from "@/lib/api";

export default function LawyerDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userName = currentUser.username || "Advocate";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [casesData, analyticsData] = await Promise.all([
        fetchCases(),
        fetchAnalytics(),
      ]);
      console.log("Fetched cases:", casesData);
      setCases(casesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard/lawyer" },
    { title: "My Cases", icon: FileText, url: "/cases" },
    { title: "Upload Documents", icon: Upload, url: "/upload" },
    { title: "AI Counsel", icon: MessageSquare, url: "/aicounsel" },
    { title: "Alerts & Deadlines", icon: Bell, url: "/alerts" },
    { title: "Settings", icon: Settings, url: "/settings" },
  ];

  const upcomingHearings = cases
    .filter((c) => c.nextHearing)
    .sort(
      (a, b) =>
        new Date(a.nextHearing!).getTime() - new Date(b.nextHearing!).getTime(),
    )
    .slice(0, 3);

  const recentCases = cases.slice(0, 5);

  const handleLogout = () => {
    import("@/lib/auth").then(({ handleLogout }) => {
      handleLogout(navigate);
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <Sidebar className="border-r border-border">
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-sidebar-primary" />
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">
                  UDAAN
                </h1>
                <p className="text-xs text-sidebar-foreground/70">
                  Lawyer Portal
                </p>
              </div>
            </div>
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search cases, documents..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {analytics?.upcomingHearings > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-accent flex items-center justify-center">
                        <span className="text-sm font-semibold text-accent-foreground">
                          {userName.charAt(0)}
                        </span>
                      </div>
                      <div className="text-sm text-left">
                        <div className="font-medium">{userName}</div>
                        <div className="text-xs text-muted-foreground">
                          Lawyer
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-hero text-primary rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2">
                  Welcome back, {userName.split(".")[1] || userName}
                </h2>
                <p className="text-primary/90">
                  You have {analytics?.upcomingHearings || 0} upcoming hearings
                  and {analytics?.pendingReviews || 0} documents pending review.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Cases
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.activeCases || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cases you're handling
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Reviews
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.pendingReviews || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Documents to review
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Upcoming Hearings
                    </CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.upcomingHearings || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Documents Uploaded
                    </CardTitle>
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.documentsUploaded || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* My Cases */}
                <Card>
                  <CardHeader>
                    <CardTitle>My Cases</CardTitle>
                    <CardDescription>
                      Cases you're currently handling
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {loading ? (
                        <p className="text-sm text-muted-foreground">
                          Loading cases...
                        </p>
                      ) : recentCases.length > 0 ? (
                        recentCases.map((case_) => (
                          <div
                            key={case_._id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/cases/${case_._id}`)}
                          >
                            <FolderOpen className="h-5 w-5 text-primary mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {case_.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Case #{case_._id} • {case_.court}
                              </div>
                              <Badge variant="secondary" className="mt-2">
                                {case_.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No cases found
                        </p>
                      )}
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/cases">View All Cases</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Hearings & Deadlines */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Upcoming Hearings & Deadlines
                    </CardTitle>
                    <CardDescription>
                      Stay on top of your schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingHearings.length > 0 ? (
                        upcomingHearings.map((hearing) => (
                          <div
                            key={hearing._id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-border bg-accent/5"
                          >
                            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                              <AlertCircle className="h-5 w-5 text-accent" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                Case #{hearing._id}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {hearing.court}
                              </div>
                              <div className="text-xs font-medium text-primary mt-1">
                                {new Date(
                                  hearing.nextHearing!,
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No upcoming hearings
                        </p>
                      )}
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/alerts">View All Alerts</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      asChild
                    >
                      <Link to="/upload">
                        <Upload className="h-6 w-6" />
                        <span className="text-sm">Upload Document</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      asChild
                    >
                      <Link to="/aicounsel">
                        <MessageSquare className="h-6 w-6" />
                        <span className="text-sm">AI Counsel</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      asChild
                    >
                      <Link to="/cases">
                        <FileText className="h-6 w-6" />
                        <span className="text-sm">View Cases</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      asChild
                    >
                      <Link to="/settings">
                        <Settings className="h-6 w-6" />
                        <span className="text-sm">Settings</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Floating AI Chatbot */}
      <FloatingChatbot
        userId={currentUser.username}
        userRole="lawyer"
        activeCaseIds={cases.map((c) => c._id)}
      />
    </SidebarProvider>
  );
}
