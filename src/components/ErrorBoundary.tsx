import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ errorInfo: info });
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info);
    }
    
    // Call custom error handler if provided
    this.props.onError?.(error, info);
    
    // Log to external service in production
    if (import.meta.env.PROD) {
      // TODO: Add error logging service (Sentry, LogRocket, etc.)
      console.error('Production Error:', {
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    this.handleReset();
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="text-center rounded-2xl bg-card p-8 shadow-lg max-w-md w-full">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-black text-foreground mb-2">Nimadir sindi</h2>
            <p className="text-muted-foreground font-semibold mb-4">
              {this.state.error?.message || 'Kutilmagan xato yuz berdi.'}
            </p>
            
            {import.meta.env.DEV && this.state.errorInfo && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm font-mono text-muted-foreground">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
            
            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleGoHome}
                className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lg transition-all active:scale-[0.97]"
              >
                Bosh sahifa 🏠
              </button>
              <button
                onClick={this.handleReset}
                className="rounded-xl px-6 py-3 font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Qayta urinish
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
