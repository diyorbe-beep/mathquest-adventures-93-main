import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
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
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="text-center rounded-2xl bg-card p-8 shadow-lg max-w-sm">
            <div className="text-5xl mb-4">😵</div>
            <h2 className="text-xl font-black text-foreground mb-2">Nimadir sindi</h2>
            <p className="text-muted-foreground font-semibold mb-4">
              {this.state.error?.message || 'Kutilmagan xato yuz berdi.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/dashboard';
              }}
              className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lg transition-all active:scale-[0.97]"
            >
              Bosh sahifa 🏠
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
