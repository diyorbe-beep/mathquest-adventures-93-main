/**
 * Performance Monitoring and Analytics System
 * Tracks user behavior, performance metrics, and application health
 */

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage?: number;
  connectionType?: string;
}

interface UserEvent {
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  type: 'javascript' | 'network' | 'security';
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private userId: string | null = null;
  private metricsQueue: PerformanceMetrics[] = [];
  private eventsQueue: UserEvent[] = [];
  private errorsQueue: ErrorEvent[] = [];
  private isOnline = navigator.onLine;
  private startTime = Date.now();

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializePerformanceMonitoring();
    this.initializeErrorTracking();
    this.initializeNetworkMonitoring();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Performance Monitoring
  private initializePerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.collectPageLoadMetrics();
        }, 0);
      });

      // Monitor Core Web Vitals
      this.observeCoreWebVitals();
    }
  }

  private collectPageLoadMetrics(): void {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const metrics: PerformanceMetrics = {
      pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      connectionType: (navigator as any).connection?.effectiveType
    };

    // Get paint timing
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.firstContentfulPaint = fcpEntry.startTime;
    }

    // Get memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = memory.usedJSHeapSize;
    }

    this.recordMetrics(metrics);
  }

  private observeCoreWebVitals(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.updateMetric('largestContentfulPaint', lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch {
        // LCP not supported
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.updateMetric('cumulativeLayoutShift', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch {
        // CLS not supported
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.updateMetric('firstInputDelay', (entry as any).processingStart - entry.startTime);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch {
        // FID not supported
      }
    }
  }

  private updateMetric(name: keyof PerformanceMetrics, value: number): void {
    if (this.metricsQueue.length > 0) {
      const lastMetrics = this.metricsQueue[this.metricsQueue.length - 1];
      // Use type assertion to handle dynamic property assignment
      (lastMetrics as any)[name] = value;
    }
  }

  // Error Tracking
  private initializeErrorTracking(): void {
    window.addEventListener('error', (event) => {
      this.recordError({
        message: event.message,
        stack: event.error?.stack,
        type: 'javascript',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.userId || undefined,
        sessionId: this.sessionId
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        message: `Boshqarilmagan va'da xatosi: ${event.reason}`,
        stack: event.reason?.stack,
        type: 'javascript',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.userId || undefined,
        sessionId: this.sessionId
      });
    });
  }

  // Network Monitoring
  private initializeNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueues();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Monitor fetch errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.recordError({
            message: `HTTP Xatosi: ${response.status} ${response.statusText}`,
            type: 'network',
            timestamp: Date.now(),
            url: args[0] as string,
            userAgent: navigator.userAgent,
            userId: this.userId || undefined,
            sessionId: this.sessionId
          });
        }
        return response;
      } catch (error) {
        this.recordError({
          message: `Tarmoq xatosi: ${error}`,
          type: 'network',
          timestamp: Date.now(),
          url: args[0] as string,
          userAgent: navigator.userAgent,
          userId: this.userId || undefined,
          sessionId: this.sessionId
        });
        throw error;
      }
    };
  }

  // Public API
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public trackEvent(category: string, action: string, label?: string, value?: number, metadata?: Record<string, any>): void {
    const event: UserEvent = {
      type: 'user_action',
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId || undefined,
      metadata
    };

    this.eventsQueue.push(event);
    this.trySendEvents();
  }

  public trackPageView(path: string, title?: string): void {
    this.trackEvent('navigation', 'page_view', path, undefined, { title });
  }

  public trackUserInteraction(element: string, action: string, context?: Record<string, any>): void {
    this.trackEvent('user_interaction', action, element, undefined, context);
  }

  public trackPerformance(metricName: string, value: number, context?: Record<string, any>): void {
    this.trackEvent('performance', metricName, undefined, value, context);
  }

  public trackError(error: Error, context?: Record<string, any>): void {
    this.recordError({
      message: error.message,
      stack: error.stack,
      type: 'javascript',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      ...context
    });
  }

  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metricsQueue.push(metrics);
    this.trySendMetrics();
  }

  private recordError(error: ErrorEvent): void {
    this.errorsQueue.push(error);
    this.trySendErrors();
  }

  private async trySendMetrics(): Promise<void> {
    if (!this.isOnline || this.metricsQueue.length === 0) return;
    try {
      await this.sendToEndpoint('/api/analytics/metrics', this.metricsQueue);
      this.metricsQueue = [];
    } catch (error) {
      if (import.meta.env.DEV) console.error('Metrikalarni yuborishda xatolik:', error);
    }
  }

  private async trySendEvents(): Promise<void> {
    if (!this.isOnline || this.eventsQueue.length === 0) return;
    try {
      await this.sendToEndpoint('/api/analytics/events', this.eventsQueue);
      this.eventsQueue = [];
    } catch (error) {
      if (import.meta.env.DEV) console.error('Hodisalarni yuborishda xatolik:', error);
    }
  }

  private async trySendErrors(): Promise<void> {
    if (!this.isOnline || this.errorsQueue.length === 0) return;
    try {
      await this.sendToEndpoint('/api/analytics/errors', this.errorsQueue);
      this.errorsQueue = [];
    } catch (error) {
      if (import.meta.env.DEV) console.error('Xatolarni yuborishda xatolik:', error);
    }
  }

  private async sendToEndpoint(endpoint: string, data: any): Promise<void> {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  }

  private flushQueues(): void {
    this.trySendMetrics();
    this.trySendEvents();
    this.trySendErrors();
  }

  // Performance analysis
  public getPerformanceReport(): {
    metrics: PerformanceMetrics[];
    events: UserEvent[];
    errors: ErrorEvent[];
    summary: {
      totalEvents: number;
      totalErrors: number;
      averagePageLoadTime: number;
      sessionDuration: number;
    };
  } {
    const totalEvents = this.eventsQueue.length;
    const totalErrors = this.errorsQueue.length;
    const averagePageLoadTime = this.metricsQueue.length > 0 
      ? this.metricsQueue.reduce((sum, m) => sum + m.pageLoadTime, 0) / this.metricsQueue.length 
      : 0;
    const sessionDuration = Date.now() - this.startTime;

    return {
      metrics: this.metricsQueue,
      events: this.eventsQueue,
      errors: this.errorsQueue,
      summary: {
        totalEvents,
        totalErrors,
        averagePageLoadTime,
        sessionDuration
      }
    };
  }

  public clearData(): void {
    this.metricsQueue = [];
    this.eventsQueue = [];
    this.errorsQueue = [];
  }
}

// React Hook for Analytics
export const useAnalytics = () => {
  const analytics = AnalyticsService.getInstance();

  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserInteraction: analytics.trackUserInteraction.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    getPerformanceReport: analytics.getPerformanceReport.bind(analytics),
    clearData: analytics.clearData.bind(analytics)
  };
};

// Export singleton instance
export const analytics = AnalyticsService.getInstance();

// Performance monitoring utilities
export const performanceUtils = {
  measureFunction: <T extends (...args: any[]) => any>(fn: T, name: string): T => {
    return ((...args: any[]) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      analytics.trackPerformance(name, end - start);
      return result;
    }) as T;
  },

  measureAsyncFunction: <T extends (...args: any[]) => Promise<any>>(fn: T, name: string): T => {
    return (async (...args: any[]) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      analytics.trackPerformance(name, end - start);
      return result;
    }) as T;
  },

  mark: (name: string): void => {
    if (performance.mark) {
      performance.mark(name);
    }
  },

  measure: (name: string, startMark: string, endMark?: string): number => {
    if (performance.measure) {
      const measure = performance.measure(name, startMark, endMark);
      return measure.duration;
    }
    return 0;
  }
};
