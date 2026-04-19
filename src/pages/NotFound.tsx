import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log 404 errors in development only
    if (import.meta.env.DEV) {
      console.error(
        "404 Xato: Foydalanuvchi mavjud bo'lmagan yo'lni ochishga harakat qildi:",
        location.pathname
      );
    } else {
      // In production, send to error tracking
      // TODO: Implement proper error tracking service
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: '404_error',
          path: location.pathname,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      }).catch(() => {
        // Silent fail - don't throw in error handler
      });
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Sahifa topilmadi</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Bosh sahifaga qaytish
        </a>
      </div>
    </div>
  );
};

export default NotFound;
