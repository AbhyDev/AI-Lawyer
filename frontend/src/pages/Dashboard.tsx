import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Scale,
  FileText,
  Upload,
  MessageSquare,
  Bell,
  Settings,
  LayoutDashboard,
  User,
  Search,
  Clock,
  TrendingUp,
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
    { title: "Case Files", icon: FileText, url: "/cases" },
    { title: "Document Upload", icon: Upload, url: "/upload" },
    { title: "AI Counsel", icon: MessageSquare, url: "/ai-counsel" },
    { title: "Alerts", icon: Bell, url: "/alerts" },
    { title: "Settings", icon: Settings, url: "/settings" },
  ];

  const recentCases = [
    {
      id: "452/2024",
      title: "Contract Dispute - ABC Corp",
      status: "Active",
      updated: "2 hours ago",
    },
    {
      id: "453/2024",
      title: "Property Rights - Sharma vs Kumar",
      status: "Pending Review",
      updated: "5 hours ago",
    },
    {
      id: "454/2024",
      title: "Employment Law - Tech Solutions Ltd",
      status: "Active",
      updated: "1 day ago",
    },
  ];

  const upcomingHearings = [
    { case: "452/2024", date: "Today, 2:30 PM", court: "District Court 4" },
    { case: "455/2024", date: "Tomorrow, 11:00 AM", court: "High Court 2" },
    { case: "456/2024", date: "Jan 20, 10:00 AM", court: "Supreme Court" },
  ];

  const stats = [
    { label: "Active Cases", value: "24", icon: FileText, trend: "+3" },
    { label: "Pending Reviews", value: "8", icon: Clock, trend: "-2" },
    { label: "Upcoming Hearings", value: "5", icon: Bell, trend: "+1" },
    { label: "Success Rate", value: "87%", icon: TrendingUp, trend: "+5%" },
  ];

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
                  Justice Portal
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
                    placeholder="Ask UDAAN anything..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
                </Button>
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-gradient-accent flex items-center justify-center">
                    <User className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Adv. Rajesh Kumar</div>
                    <div className="text-xs text-muted-foreground">Lawyer</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-hero text-primary rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2">
                  Welcome back, Adv. Rajesh Kumar
                </h2>
                <p className="text-primary-foreground/90">
                  You have 5 upcoming hearings this week and 8 documents pending
                  review.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-accent font-medium">
                          {stat.trend}
                        </span>{" "}
                        from last week
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Cases */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Cases</CardTitle>
                    <CardDescription>
                      Your most recently updated cases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentCases.map((case_) => (
                        <div
                          key={case_.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {case_.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Case #{case_.id}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-medium text-accent">
                              {case_.status}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {case_.updated}
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/cases">View All Cases</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Hearings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Hearings</CardTitle>
                    <CardDescription>
                      Your scheduled court appearances
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingHearings.map((hearing, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border"
                        >
                          <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                            <Clock className="h-5 w-5 text-secondary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              Case #{hearing.case}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {hearing.court}
                            </div>
                            <div className="text-xs font-medium text-primary mt-1">
                              {hearing.date}
                            </div>
                          </div>
                        </div>
                      ))}
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
                      <Link to="/ai-counsel">
                        <MessageSquare className="h-6 w-6" />
                        <span className="text-sm">Ask AI Counsel</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      asChild
                    >
                      <Link to="/cases">
                        <FileText className="h-6 w-6" />
                        <span className="text-sm">New Case</span>
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
    </SidebarProvider>
  );
};

export default Dashboard;
