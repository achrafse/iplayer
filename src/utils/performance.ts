/**
 * Performance Optimization Utilities
 * Provides tools for monitoring and optimizing app performance
 */

import { Platform } from 'react-native';

// Performance metrics storage
interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = __DEV__;

  /**
   * Start measuring performance for a specific operation
   */
  start(name: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      name,
      startTime: Date.now(),
      metadata,
    });
  }

  /**
   * End measurement and calculate duration
   */
  end(name: string) {
    if (!this.isEnabled) return;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`);
      return;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${duration}ms`, metric.metadata);
    }

    return duration;
  }

  /**
   * Get all recorded metrics
   */
  getMetrics() {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Debounce function for limiting function calls
 * Useful for search inputs, scroll handlers, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for limiting function execution rate
 * Useful for scroll events, window resize, etc.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Lazy load images with intersection observer (web only)
 */
export const createLazyImageLoader = () => {
  if (Platform.OS !== 'web') {
    return null;
  }

  const imageCache = new Set<string>();
  const observers = new Map<string, IntersectionObserver>();

  const loadImage = (url: string): Promise<void> => {
    if (imageCache.has(url)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        imageCache.add(url);
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const observeImage = (
    element: HTMLElement,
    url: string,
    callback: (loaded: boolean) => void
  ) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage(url)
              .then(() => callback(true))
              .catch(() => callback(false));
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin: '50px', // Load images 50px before they enter viewport
      }
    );

    observer.observe(element);
    observers.set(url, observer);
  };

  const cleanup = () => {
    observers.forEach((observer) => observer.disconnect());
    observers.clear();
  };

  return {
    loadImage,
    observeImage,
    cleanup,
    isImageCached: (url: string) => imageCache.has(url),
  };
};

/**
 * Memory management utilities
 */
export const memoryManager = {
  /**
   * Clear image cache (React Native Image component)
   */
  clearImageCache: async () => {
    if (Platform.OS !== 'web') {
      const { Image } = await import('react-native');
      // Note: Image.clearMemoryCache is not available in all RN versions
      // This is a placeholder for custom implementation
      console.log('Clearing image cache...');
    }
  },

  /**
   * Force garbage collection (development only)
   */
  forceGC: () => {
    if (__DEV__ && global.gc) {
      global.gc();
      console.log('Garbage collection forced');
    }
  },

  /**
   * Get memory usage (web only)
   */
  getMemoryUsage: () => {
    if (Platform.OS === 'web' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize / 1048576, // MB
        totalJSHeapSize: memory.totalJSHeapSize / 1048576, // MB
        jsHeapSizeLimit: memory.jsHeapSizeLimit / 1048576, // MB
      };
    }
    return null;
  },
};

/**
 * Bundle size optimization helpers
 */
export const bundleOptimization = {
  /**
   * Lazy load a component
   */
  lazyLoadComponent: <T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
  ) => {
    if (Platform.OS === 'web') {
      const React = require('react');
      return React.lazy(importFunc);
    }
    // For React Native, return a wrapper that loads on mount
    return importFunc;
  },

  /**
   * Preload component for faster loading
   */
  preloadComponent: async (importFunc: () => Promise<any>) => {
    try {
      await importFunc();
    } catch (error) {
      console.error('Failed to preload component:', error);
    }
  },
};

/**
 * Network optimization
 */
export const networkOptimization = {
  /**
   * Check if device is on slow network
   */
  isSlowNetwork: (): boolean => {
    if (Platform.OS === 'web' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      const slowConnections = ['slow-2g', '2g', '3g'];
      return slowConnections.includes(connection.effectiveType);
    }
    return false;
  },

  /**
   * Get optimal image quality based on network
   */
  getOptimalImageQuality: (): 'low' | 'medium' | 'high' => {
    if (networkOptimization.isSlowNetwork()) {
      return 'low';
    }
    return 'high';
  },

  /**
   * Prefetch URLs
   */
  prefetchUrls: async (urls: string[]) => {
    if (Platform.OS === 'web') {
      urls.forEach((url) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    }
  },
};

/**
 * Frame rate monitor for detecting performance issues
 */
export class FrameRateMonitor {
  private frameCount = 0;
  private lastTime = Date.now();
  private fps = 60;
  private isRunning = false;
  private rafId: number | null = null;

  start() {
    if (this.isRunning || Platform.OS !== 'web') return;

    this.isRunning = true;
    this.frameCount = 0;
    this.lastTime = Date.now();

    const measureFrame = () => {
      this.frameCount++;
      const currentTime = Date.now();
      const elapsed = currentTime - this.lastTime;

      if (elapsed >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / elapsed);
        this.frameCount = 0;
        this.lastTime = currentTime;

        // Warn if FPS drops below 30
        if (this.fps < 30) {
          console.warn(`Low FPS detected: ${this.fps}`);
        }
      }

      if (this.isRunning) {
        this.rafId = requestAnimationFrame(measureFrame);
      }
    };

    this.rafId = requestAnimationFrame(measureFrame);
  }

  stop() {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getFPS() {
    return this.fps;
  }
}

/**
 * Measure component render time
 */
export const measureRenderTime = (componentName: string) => {
  const startTime = Date.now();

  return () => {
    const endTime = Date.now();
    const renderTime = endTime - startTime;

    if (renderTime > 16) {
      // Slower than 60fps
      console.warn(`${componentName} render took ${renderTime}ms`);
    }

    return renderTime;
  };
};

/**
 * Batch updates to prevent multiple re-renders
 */
export const batchUpdates = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 0
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    pendingArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (pendingArgs) {
        callback(...pendingArgs);
        pendingArgs = null;
      }
      timeoutId = null;
    }, delay);
  };
};
