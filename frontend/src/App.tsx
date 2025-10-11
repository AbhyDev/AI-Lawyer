import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import LawyerDashboard from "./pages/LawyerDashboard";
import JudgeDashboard from "./pages/JudgeDashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import CaseFiles from "./pages/CaseFiles";
import CaseDetail from "./pages/CaseDetail";
import DocumentUpload from "./pages/DocumentUpload";
import AICounsel from "./pages/AICounsel";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLayout from "./components/AuthLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="udaan-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/dashboard/lawyer" element={<LawyerDashboard />} />
                <Route path="/dashboard/judge" element={<JudgeDashboard />} />
                <Route path="/dashboard/citizen" element={<CitizenDashboard />} />
                <Route path="/cases" element={<CaseFiles />} />
                <Route path="/cases/:id" element={<CaseDetail />} />
                <Route path="/upload" element={<DocumentUpload />} />
                <Route path="/aicounsel" element={<AICounsel />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
