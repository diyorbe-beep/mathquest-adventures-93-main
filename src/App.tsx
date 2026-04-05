import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ThemeToggleFab from "@/components/ThemeToggleFab";
import { handleError } from "@/lib/errorHandler";

// Lazy loaded components
const Index = lazy(() => import("./pages/Index"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TopicMap = lazy(() => import("./pages/TopicMap"));
const LessonPage = lazy(() => import("./pages/LessonPage"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const ParentStats = lazy(() => import("./pages/ParentStats"));
const AdminAccess = lazy(() => import("./pages/AdminAccess"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const ReviewPage = lazy(() => import("./pages/ReviewPage"));
const DiagnosticPage = lazy(() => import("./pages/DiagnosticPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-center">
      <div className="text-4xl mb-4 animate-bounce">🧮</div>
      <div className="text-2xl font-bold animate-pulse text-primary">Yuklanmoqda...</div>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary 
    onError={(error, errorInfo) => {
      handleError(error, {
        component: 'App',
        action: 'render',
        additionalInfo: { errorInfo }
      });
    }}
  >
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/review" element={<ReviewPage />} />
                <Route path="/diagnostic" element={<DiagnosticPage />} />
                <Route path="/admin-login" element={<Navigate to="/admin" replace />} />
                <Route path="/admin" element={<AdminAccess />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <ThemeToggleFab />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
