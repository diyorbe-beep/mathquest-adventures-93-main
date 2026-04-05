interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additionalInfo?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  component?: string;
  action?: string;
  userId?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  additionalInfo?: Record<string, any>;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: ErrorReport[] = [];
  private isOnline = navigator.onLine;

  private constructor() {
    // Handle online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        component: 'UnhandledPromiseRejection',
        action: 'unhandledrejection'
      });
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        component: 'GlobalError',
        action: 'error'
      });
    });
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private createErrorReport(error: Error, context?: ErrorContext): ErrorReport {
    return {
      message: error.message,
      stack: error.stack,
      component: context?.component,
      action: context?.action,
      userId: context?.userId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      additionalInfo: context?.additionalInfo,
    };
  }

  private async sendErrorReport(report: ErrorReport): Promise<void> {
    if (!this.isOnline) {
      this.errorQueue.push(report);
      return;
    }

    try {
      // In production, send to your error tracking service
      if (import.meta.env.PROD) {
        // TODO: Replace with your error tracking service (Sentry, LogRocket, etc.)
        // await fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(report)
        // });
        
        // For now, just log to console in production
        console.error('Production Error:', report);
      } else {
        // In development, log detailed error
        console.group('🚨 Error Caught');
        console.error('Error:', report);
        console.trace('Stack trace');
        console.groupEnd();
      }
    } catch (sendError) {
      console.error('Failed to send error report:', sendError);
      this.errorQueue.push(report);
    }
  }

  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const queuedErrors = [...this.errorQueue];
    this.errorQueue = [];

    for (const error of queuedErrors) {
      await this.sendErrorReport(error);
    }
  }

  public handleError(error: Error | unknown, context?: ErrorContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const report = this.createErrorReport(errorObj, context);
    
    this.sendErrorReport(report);
  }

  public handleAsyncError(
    asyncFn: () => Promise<any>,
    context?: ErrorContext
  ): Promise<any> {
    return asyncFn().catch((error) => {
      this.handleError(error, context);
      throw error; // Re-throw to maintain promise rejection behavior
    });
  }

  public getErrorQueue(): ErrorReport[] {
    return [...this.errorQueue];
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Export a convenience function for easy imports
export const handleError = (error: Error | unknown, context?: ErrorContext) => {
  errorHandler.handleError(error, context);
};

export const handleAsyncError = <T>(
  asyncFn: () => Promise<T>,
  context?: ErrorContext
): Promise<T> => {
  return errorHandler.handleAsyncError(asyncFn, context);
};
