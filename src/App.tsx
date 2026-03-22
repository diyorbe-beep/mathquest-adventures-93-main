import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ThemeToggleFab from "@/components/ThemeToggleFab";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import TopicMap from "./pages/TopicMap";
import LessonPage from "./pages/LessonPage";
import Leaderboard from "./pages/Leaderboard";
import AchievementsPage from "./pages/AchievementsPage";
import ProfilePage from "./pages/ProfilePage";
import MapPage from "./pages/MapPage";
import ParentStats from "./pages/ParentStats";
import AdminAccess from "./pages/AdminAccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/topic/:slug" element={<TopicMap />} />
              <Route path="/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/parent-stats" element={<ParentStats />} />
              <Route path="/admin-login" element={<Navigate to="/admin" replace />} />
              <Route path="/admin" element={<AdminAccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <ThemeToggleFab />
        </ErrorBoundary>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
