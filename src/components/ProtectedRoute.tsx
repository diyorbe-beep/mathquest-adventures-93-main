import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoles, AppRole } from '@/hooks/useRoles';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { roles, isLoading } = useRoles();

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-float">🧮</div>
          <div className="text-lg font-bold animate-pulse text-primary">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (requiredRole && !roles.includes(requiredRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center rounded-2xl bg-card p-8 shadow-lg max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-black text-foreground mb-2">Kirish rad etildi</h2>
          <p className="text-muted-foreground font-semibold mb-4">Bu sahifani ko‘rish huquqingiz yo‘q.</p>
          <a href="/dashboard" className="inline-block rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">
            Boshqaruv paneliga o‘tish
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
