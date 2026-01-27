import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Home,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Globe,
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

export default function CitizenDashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [isChatOpen, setChatOpen] = useState(false);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userName = currentUser.username || "User";

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
      setCases(casesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const content = {
    en: {
      welcome: "Welcome",
      welcomeMessage: "Track your cases and get legal assistance",
      myCases: "My Cases",
      caseStatus: "Case Status",
      nextHearing: "Next Hearing",
      askAI: "Ask AI Assistant",
      caseProgress: "Case Progress",
      quickActions: "Quick Actions",
      viewCase: "View Case Details",
      talkToAI: "Talk to AI Assistant",
      changeLanguage: "Switch to Hindi",
      noHearing: "No upcoming hearing",
      noCases: "No cases found",
      loading: "Loading your cases...",
      filed: "Filed",
      inProgress: "In Progress",
      completed: "Completed",
    },
    hi: {
      welcome: "स्वागत है",
      welcomeMessage: "अपने मामलों को ट्रैक करें और कानूनी सहायता प्राप्त करें",
      myCases: "मेरे मामले",
      caseStatus: "मामले की स्थिति",
      nextHearing: "अगली सुनवाई",
      askAI: "AI सहायक से पूछें",
      caseProgress: "मामले की प्रगति",
      quickActions: "त्वरित कार्य",
      viewCase: "मामले का विवरण देखें",
      talkToAI: "AI सहायक से बात करें",
      changeLanguage: "Switch to English",
      noHearing: "कोई आगामी सुनवाई नहीं",
      noCases: "कोई मामला नहीं मिला",
      loading: "आपके मामले लोड हो रहे हैं...",
      filed: "दायर किया गया",
      inProgress: "प्रगति में",
      completed: "पूर्ण",
    },
  };

  const t = content[language];

  const menuItems = [
    {
      title: language === "en" ? "Home" : "होम",
      icon: Home,
      url: "/dashboard/citizen",
    },
    {
      title: language === "en" ? "My Cases" : "मेरे मामले",
      icon: FileText,
      url: "/cases",
    },
    {
      title: language === "en" ? "AI Assistant" : "AI सहायक",
      icon: MessageSquare,
      url: "/aicounsel",
    },
    {
      title: language === "en" ? "Settings" : "सेटिंग्स",
      icon: Settings,
      url: "/settings",
    },
  ];

  const getProgressPercentage = (status: string): number => {
    const statusMap: Record<string, number> = {
      Filed: 25,
      Active: 50,
      "Pending Review": 75,
      Closed: 100,
    };
    return statusMap[status] || 50;
  };

  const getStatusIcon = (status: string) => {
    if (status === "Closed")
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === "Active") return <Clock className="h-5 w-5 text-blue-500" />;
    return <AlertCircle className="h-5 w-5 text-orange-500" />;
  };

  const navigate = useNavigate();

  // Import the shared logout handler
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
                  {language === "en" ? "UDAAN" : "उड़ान"}
                </h1>
                <p className="text-xs text-sidebar-foreground/70">
                  {language === "en" ? "Citizen Portal" : "नागरिक पोर्टल"}
                </p>
              </div>
            </div>
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                {language === "en" ? "Main Menu" : "मुख्य मेनू"}
              </SidebarGroupLabel>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-accent flex items-center justify-center">
                      <span className="text-lg font-semibold text-accent-foreground">
                        {userName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{userName}</div>
                      <div className="text-xs text-muted-foreground">
                        {language === "en" ? "Citizen" : "नागरिक"}
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
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              >
                <Globe className="h-4 w-4" />
                {t.changeLanguage}
              </Button>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-hero text-primary rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2">
                  {t.welcome}, {userName}!
                </h2>
                <p className="text-primary/90 text-lg">{t.welcomeMessage}</p>
              </div>

              {/* Quick Summary Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      {t.myCases}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {analytics?.myCases || cases.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "en" ? "Total cases" : "कुल मामले"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      {t.nextHearing}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {analytics?.nextHearing || t.noHearing}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "en" ? "Upcoming" : "आगामी"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      {language === "en" ? "Pending Actions" : "लंबित कार्रवाई"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {analytics?.pendingActions || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "en" ? "Action items" : "कार्रवाई आइटम"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* My Cases - Simplified View */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{t.myCases}</CardTitle>
                  <CardDescription>
                    {language === "en"
                      ? "Track the progress of your legal cases"
                      : "अपने कानूनी मामलों की प्रगति ट्रैक करें"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <p className="text-sm text-muted-foreground py-8 text-center">
                        {t.loading}
                      </p>
                    ) : cases.length > 0 ? (
                      cases.map((case_) => (
                        <Card
                          key={case_._id}
                          className="border-2 hover:border-primary/50 transition-colors"
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg">
                                  {case_.CaseName ||
                                    case_.title ||
                                    case_.Public?.case_summary?.substring(
                                      0,
                                      50,
                                    ) ||
                                    `Case #${case_.CaseID?.substring(0, 8)}`}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {language === "en" ? "ID" : "आईडी"}:{" "}
                                  {case_.CaseID || case_._id} •{" "}
                                  {case_.court ||
                                    case_.Public?.court_details?.name}
                                </CardDescription>
                              </div>
                              {getStatusIcon(case_.status)}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {t.caseProgress}
                                </span>
                                <span className="font-medium">
                                  {getProgressPercentage(case_.status)}%
                                </span>
                              </div>
                              <Progress
                                value={getProgressPercentage(case_.status)}
                                className="h-2"
                              />
                            </div>

                            {/* Case Details */}
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  {language === "en"
                                    ? "Filed on:"
                                    : "दायर किया गया:"}
                                </span>
                                <p className="font-medium">
                                  {new Date(
                                    case_.filingDate,
                                  ).toLocaleDateString(
                                    language === "hi" ? "hi-IN" : "en-IN",
                                  )}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  {language === "en" ? "Status:" : "स्थिति:"}
                                </span>
                                <div className="mt-1">
                                  <Badge variant="secondary">
                                    {case_.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Next Hearing */}
                            {case_.nextHearing && (
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                                <Calendar className="h-5 w-5 text-accent mt-0.5" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium">
                                    {language === "en"
                                      ? "Next Hearing"
                                      : "अगली सुनवाई"}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(case_.nextHearing).toLocaleString(
                                      language === "hi" ? "hi-IN" : "en-IN",
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="flex-1"
                                asChild
                              >
                                <Link to={`/cases/${case_._id}`}>
                                  {t.viewCase}
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                asChild
                              >
                                <Link to={`/aicounsel?caseId=${case_._id}`}>
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  {t.askAI}
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">{t.noCases}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.quickActions}</CardTitle>
                  <CardDescription>
                    {language === "en"
                      ? "Common actions and help"
                      : "सामान्य कार्य और सहायता"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-4 justify-start gap-3"
                      asChild
                    >
                      <Link to="/aicounsel">
                        <MessageSquare className="h-6 w-6" />
                        <div className="text-left">
                          <div className="font-medium">{t.talkToAI}</div>
                          <div className="text-xs text-muted-foreground">
                            {language === "en"
                              ? "Get instant legal guidance"
                              : "तुरंत कानूनी मार्गदर्शन प्राप्त करें"}
                          </div>
                        </div>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 justify-start gap-3"
                      asChild
                    >
                      <Link to="/cases">
                        <FileText className="h-6 w-6" />
                        <div className="text-left">
                          <div className="font-medium">
                            {language === "en"
                              ? "View All Cases"
                              : "सभी मामले देखें"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {language === "en"
                              ? "Complete case history"
                              : "पूर्ण मामले का इतिहास"}
                          </div>
                        </div>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Help Section */}
              <Card className="bg-accent/5 border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-accent" />
                    {language === "en" ? "Need Help?" : "मदद चाहिए?"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === "en"
                      ? "Our AI assistant is available 24/7 to answer your questions in simple language. Click the chat button to get started."
                      : "हमारा AI सहायक 24/7 आपके सवालों का जवाब सरल भाषा में देने के लिए उपलब्ध है। शुरू करने के लिए चैट बटन पर क्लिक करें।"}
                  </p>
                  <Button className="gap-2" onClick={() => setChatOpen(true)}>
                    <MessageSquare className="h-4 w-4" />
                    {language === "en" ? "Start Chatting" : "बातचीत शुरू करें"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Floating AI Chatbot - Multilingual */}
      <FloatingChatbot
        userId={currentUser.username}
        userRole="user"
        activeCaseIds={cases.map((c) => c._id)}
        initialOpen={isChatOpen}
      />
    </SidebarProvider>
  );
}
