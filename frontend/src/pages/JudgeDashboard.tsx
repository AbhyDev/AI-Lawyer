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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  MessageSquare,
  Settings,
  LayoutDashboard,
  Search,
  Eye,
  BarChart3,
  Filter,
  Calendar,
  FolderOpen,
  TrendingUp,
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

export default function JudgeDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userName = currentUser.username || "Your Honor";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Judges can see all cases
      const [casesData, analyticsData] = await Promise.all([
        fetchCases(),
        fetchAnalytics(),
      ]);
      setCases(casesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard/judge" },
    { title: "All Cases", icon: FileText, url: "/cases" },
    { title: "Analytics", icon: BarChart3, url: "/analytics" },
    { title: "AI Counsel", icon: MessageSquare, url: "/aicounsel" },
    { title: "Settings", icon: Settings, url: "/settings" },
  ];

  const filteredCases =
    filterStatus === "all"
      ? cases
      : cases.filter((c) =>
          c.status.toLowerCase().includes(filterStatus.toLowerCase()),
        );

  const pendingReviewCases = cases.filter((c) => c.status === "Pending Review");

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
                  Judge Portal
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
                    placeholder="Search all cases..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter:{" "}
                      {filterStatus === "all" ? "All Cases" : filterStatus}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                      All Cases
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterStatus("Pending Review")}
                    >
                      Pending Review
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterStatus("Under Review")}
                    >
                      Under Review
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterStatus("Hearing Scheduled")}
                    >
                      Hearing Scheduled
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("Closed")}>
                      Closed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                          Judge
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
                  Good day, Your Honor
                </h2>
                <p className="text-primary/90">
                  You have {analytics?.pendingReviews || 0} cases pending
                  review. {analytics?.completedThisMonth || 0} cases completed
                  this month.
                </p>
              </div>

              {/* Tabs for different views */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="pending">Pending Review</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Cases Reviewed
                        </CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analytics?.totalCasesReviewed || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          All time
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Pending Reviews
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analytics?.pendingReviews || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Awaiting judgment
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Completed This Month
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analytics?.completedThisMonth || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Cases resolved
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Avg Review Time
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analytics?.avgReviewTime || "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Per case
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* All Cases */}
                  <Card>
                    <CardHeader>
                      <CardTitle>All Cases</CardTitle>
                      <CardDescription>
                        Complete case docket - read-only access
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {loading ? (
                          <p className="text-sm text-muted-foreground">
                            Loading cases...
                          </p>
                        ) : filteredCases.length > 0 ? (
                          filteredCases.slice(0, 5).map((case_) => (
                            <div
                              key={case_._id}
                              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/cases/${case_._id}`)}
                            >
                              <FolderOpen className="h-5 w-5 text-primary mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {case_.CaseName ||
                                    case_.title ||
                                    case_.Public?.case_summary?.substring(
                                      0,
                                      50,
                                    ) ||
                                    `Case #${case_.CaseID?.substring(0, 8)}`}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  ID: {case_.CaseID || case_._id} •{" "}
                                  {case_.court ||
                                    case_.Public?.court_details?.name}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary">
                                    {case_.status}
                                  </Badge>
                                  <Badge variant="outline">
                                    {case_.category}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                Review
                              </Button>
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
                </TabsContent>

                {/* Pending Review Tab */}
                <TabsContent value="pending" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cases Pending Your Review</CardTitle>
                      <CardDescription>
                        {pendingReviewCases.length} cases awaiting judgment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {pendingReviewCases.length > 0 ? (
                          pendingReviewCases.map((case_) => (
                            <div
                              key={case_._id}
                              className="flex items-start gap-3 p-4 rounded-lg border border-border bg-accent/5"
                            >
                              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-5 w-5 text-accent" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">
                                  {case_.CaseName ||
                                    case_.title ||
                                    case_.Public?.case_summary?.substring(
                                      0,
                                      50,
                                    ) ||
                                    `Case #${case_.CaseID?.substring(0, 8)}`}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  ID: {case_.CaseID || case_._id} • Filed:{" "}
                                  {new Date(
                                    case_.filingDate || case_.createdAt,
                                  ).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {case_.parties.petitioner} vs{" "}
                                  {case_.parties.respondent}
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    className="gap-1"
                                    onClick={() =>
                                      navigate(`/cases/${case_._id}`)
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                    Review Case
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1"
                                    onClick={() =>
                                      navigate(`/aicounsel?caseId=${case_._id}`)
                                    }
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                    AI Summary
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground py-4">
                            No cases pending review
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Case Distribution by Category</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            "Civil",
                            "Property",
                            "Employment",
                            "Criminal",
                            "Family",
                          ].map((category) => {
                            const count = cases.filter(
                              (c) => c.category === category,
                            ).length;
                            const percentage =
                              cases.length > 0
                                ? (count / cases.length) * 100
                                : 0;
                            return (
                              <div key={category} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {category}
                                  </span>
                                  <span className="font-medium">
                                    {count} cases ({percentage.toFixed(0)}%)
                                  </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Case Status Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            "Active",
                            "Pending Review",
                            "Closed",
                            "Adjourned",
                          ].map((status) => {
                            const count = cases.filter(
                              (c) => c.status === status,
                            ).length;
                            return (
                              <div
                                key={status}
                                className="flex justify-between items-center p-3 rounded-lg border"
                              >
                                <span className="text-sm font-medium">
                                  {status}
                                </span>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                      <CardDescription>
                        Your judicial performance overview
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                          <div className="text-sm text-muted-foreground mb-1">
                            Cases This Month
                          </div>
                          <div className="text-2xl font-bold">
                            {analytics?.completedThisMonth || 0}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                          <div className="text-sm text-muted-foreground mb-1">
                            Average Review Time
                          </div>
                          <div className="text-2xl font-bold">
                            {analytics?.avgReviewTime || "N/A"}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                          <div className="text-sm text-muted-foreground mb-1">
                            Pending Backlog
                          </div>
                          <div className="text-2xl font-bold">
                            {analytics?.pendingReviews || 0}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common judicial functions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      asChild
                    >
                      <Link to="/cases">
                        <Eye className="h-6 w-6" />
                        <span className="text-sm">Review Cases</span>
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
                      <Link to="/dashboard/judge#analytics">
                        <BarChart3 className="h-6 w-6" />
                        <span className="text-sm">Analytics</span>
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
        userRole="judge"
        activeCaseIds={cases.map((c) => c._id)}
      />
    </SidebarProvider>
  );
}
