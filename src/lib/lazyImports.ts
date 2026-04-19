/**
 * Lazy Import Utilities
 * Optimizes bundle size by loading components on demand
 */

import { useState, useEffect, lazy, type RefObject } from 'react';

// Lazy load heavy components
export const lazyLoadComponent = (importFunc: () => Promise<any>) => {
  return importFunc;
};

// Specific lazy imports for commonly used heavy components
export const lazyComponents = {
  // Chart components
  BarChart: () => import('recharts').then(mod => ({ default: mod.BarChart })),
  LineChart: () => import('recharts').then(mod => ({ default: mod.LineChart })),
  PieChart: () => import('recharts').then(mod => ({ default: mod.PieChart })),
  
  // Admin components
  AdminDashboard: () => import('@/pages/AdminPage').then(mod => ({ default: mod.default })),
  
  // Other heavy components (add as needed)
  // DataVisualization: () => import('@/components/DataVisualization').then(mod => ({ default: mod.default })),
  // AdvancedEditor: () => import('@/components/AdvancedEditor').then(mod => ({ default: mod.default })),
  // AnalyticsPanel: () => import('@/components/AnalyticsPanel').then(mod => ({ default: mod.default })),
  // AudioPlayer: () => import('@/components/AudioPlayer').then(mod => ({ default: mod.default })),
  // VideoPlayer: () => import('@/components/VideoPlayer').then(mod => ({ default: mod.default })),
};

// Dynamic import hook
export const useDynamicImport = <T>(
  importFunc: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        setLoading(true);
        const module = await importFunc();
        if (isMounted) {
          setComponent(module);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load component');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { component, loading, error };
};

// Preload utility
export const preloadComponent = (importFunc: () => Promise<any>) => {
  // Start loading the component in the background
  importFunc().catch(() => {
    // Ignore errors during preload
  });
};

// Intersection Observer for lazy loading
export const useIntersectionObserver = (
  ref: RefObject<Element>,
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
        observer.unobserve(element);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, callback, options]);
};

// Note: LazyImage component can be added later when needed
// For now, focusing on core lazy loading functionality

// Bundle splitting utilities
export const createLazyRoute = (componentPath: string) => {
  return lazy(() => import(componentPath).then(module => ({ default: module.default })));
};

// Preload critical routes
export const preloadRoutes = () => {
  // Preload dashboard and auth routes as they're commonly accessed
  preloadComponent(() => import('@/pages/Dashboard'));
  preloadComponent(() => import('@/pages/AuthPage'));
};

// Icon lazy loading
export const lazyIcons = {
  // Load icons on demand
  getIcon: (iconName: string) => import('lucide-react').then(icons => icons[iconName]),
  
  // Preload commonly used icons
  preloadCommonIcons: () => {
    const commonIcons = ['Home', 'User', 'Settings', 'LogOut', 'Menu'];
    commonIcons.forEach(icon => {
      import('lucide-react').then(icons => icons[icon]).catch(() => {});
    });
  }
};

// Utility for conditional loading
export const loadWhenVisible = <T,>(
  importFunc: () => Promise<T>,
  condition: boolean
): Promise<T | null> => {
  if (!condition) return Promise.resolve(null);
  return importFunc();
};

// Performance monitoring for lazy loads
export const trackLazyLoad = (componentName: string, _loadTime: number) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`${componentName}-loaded`);
    performance.measure(
      `${componentName}-load-time`,
      `${componentName}-start`,
      `${componentName}-loaded`
    );
  }
};
