/**
 * Advanced Rate Limiting System
 * Provides comprehensive API rate limiting and security features
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

class RateLimiter {
  private static instance: RateLimiter;
  private store = new Map<string, {
    count: number;
    resetTime: number;
    windowMs: number;
    maxRequests: number;
  }>();

  private constructor() {
    // Clean up expired entries periodically
    setInterval(() => {
      this.cleanup();
    }, 60000); // Clean up every minute
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  // Check if request is allowed
  isAllowed(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const existing = this.store.get(key);

    // If no existing record, create new one
    if (!existing) {
      const newRecord = {
        count: 1,
        resetTime: now + config.windowMs,
        windowMs: config.windowMs,
        maxRequests: config.maxRequests
      };
      this.store.set(key, newRecord);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newRecord.resetTime
      };
    }

    // Check if window has expired
    if (now > existing.resetTime) {
      const newRecord = {
        count: 1,
        resetTime: now + config.windowMs,
        windowMs: config.windowMs,
        maxRequests: config.maxRequests
      };
      this.store.set(key, newRecord);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newRecord.resetTime
      };
    }

    // Check if limit exceeded
    if (existing.count >= existing.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: existing.resetTime,
        message: config.message || `So'rovlar chegarasi oshib ketdi. ${Math.ceil((existing.resetTime - now) / 1000)} soniyadan so'ng urinib ko'ring.`
      };
    }

    // Increment count
    existing.count++;
    this.store.set(key, existing);

    return {
      allowed: true,
      remaining: existing.maxRequests - existing.count,
      resetTime: existing.resetTime
    };
  }

  // Reset rate limit for a key
  reset(key: string): void {
    this.store.delete(key);
  }

  // Get current status for a key
  getStatus(key: string): { count: number; remaining: number; resetTime: number } | null {
    const record = this.store.get(key);
    if (!record) return null;

    return {
      count: record.count,
      remaining: Math.max(0, record.maxRequests - record.count),
      resetTime: record.resetTime
    };
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }

  // Get statistics
  getStats(): { totalKeys: number; activeKeys: number } {
    const now = Date.now();
    let activeKeys = 0;

    for (const record of this.store.values()) {
      if (now <= record.resetTime) {
        activeKeys++;
      }
    }

    return {
      totalKeys: this.store.size,
      activeKeys
    };
  }
}

// API Rate Limiting Middleware
export class ApiRateLimit {
  private static rateLimiter = RateLimiter.getInstance();

  // Different rate limit configurations for different endpoints
  private static configs: Record<string, RateLimitConfig> = {
    'auth-signup': { windowMs: 15 * 60 * 1000, maxRequests: 5, message: 'Juda ko\'p ro\'yxatdan o\'tish urinishlari. Keyinroq urinib ko\'ring.' },
    'auth-signin': { windowMs: 15 * 60 * 1000, maxRequests: 10, message: 'Juda ko\'p kirish urinishlari. Keyinroq urinib ko\'ring.' },
    'api-general': { windowMs: 60 * 1000, maxRequests: 100 },
    'api-heavy': { windowMs: 60 * 1000, maxRequests: 20 },
    'file-upload': { windowMs: 60 * 1000, maxRequests: 10 },
    'analytics': { windowMs: 60 * 1000, maxRequests: 50 }
  };

  // Middleware function for Express/Next.js
  static middleware(endpointType: string) {
    const config = this.configs[endpointType] || this.configs['api-general'];
    
    return (req: Request, res: Response, next: () => void) => {
      // Get client identifier (IP address or user ID)
      const clientId = this.getClientId(req);
      const key = `${endpointType}:${clientId}`;
      
      const result = this.rateLimiter.isAllowed(key, config);
      
      // Add rate limit headers
      if (res.headers) {
        res.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
        res.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        res.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());
      }
      
      if (!result.allowed) {
        return new Response(
          JSON.stringify({ 
            error: result.message || 'So\'rovlar chegarasi oshib ketdi',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          }), 
          { 
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
            }
          }
        );
      }
      
      next();
    };
  }

  // Client-side rate limiting check
  static checkLimit(endpointType: string, clientId?: string): RateLimitResult {
    const config = this.configs[endpointType] || this.configs['api-general'];
    const key = `${endpointType}:${clientId || 'anonymous'}`;
    
    return this.rateLimiter.isAllowed(key, config);
  }

  // Get client identifier from request
  private static getClientId(req: Request): string {
    // Try to get user ID from auth token first
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      // Extract user ID from JWT token (simplified)
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sub) return payload.sub;
      } catch {
        // Invalid token, fall back to IP
      }
    }
    
    // Fall back to IP address
    return req.headers.get('x-forwarded-for') || 
           req.headers.get('x-real-ip') || 
           'unknown';
  }

  // Custom rate limiting for specific use cases
  static customLimit(key: string, config: RateLimitConfig): RateLimitResult {
    return this.rateLimiter.isAllowed(key, config);
  }

  // Reset rate limit for a specific user/IP
  static resetLimit(endpointType: string, clientId: string): void {
    const key = `${endpointType}:${clientId}`;
    this.rateLimiter.reset(key);
  }

  // Get rate limit status
  static getStatus(endpointType: string, clientId: string) {
    const key = `${endpointType}:${clientId}`;
    return this.rateLimiter.getStatus(key);
  }

  // Get global statistics
  static getStats() {
    return this.rateLimiter.getStats();
  }
}

// Security monitoring
export class SecurityMonitor {
  private static suspiciousIPs = new Set<string>();
  private static failedAttempts = new Map<string, number>();
  private static blockedIPs = new Set<string>();

  // Monitor failed attempts
  static recordFailedAttempt(clientId: string, type: string): void {
    const current = this.failedAttempts.get(clientId) || 0;
    this.failedAttempts.set(clientId, current + 1);

    // Block after too many failed attempts
    if (current + 1 >= 10) {
      this.blockIP(clientId);
    }

    // Mark as suspicious after 5 failed attempts
    if (current + 1 >= 5) {
      this.suspiciousIPs.add(clientId);
    }

    // Log security event
    this.logSecurityEvent({
      type: 'failed_attempt',
      clientId,
      attemptType: type,
      totalAttempts: current + 1,
      timestamp: Date.now()
    });
  }

  // Record successful attempt (resets failed attempts)
  static recordSuccessfulAttempt(clientId: string): void {
    this.failedAttempts.delete(clientId);
    
    if (this.suspiciousIPs.has(clientId)) {
      this.logSecurityEvent({
        type: 'suspicious_success',
        clientId,
        timestamp: Date.now()
      });
    }
  }

  // Block an IP address
  static blockIP(clientId: string, duration: number = 24 * 60 * 60 * 1000): void {
    this.blockedIPs.add(clientId);
    
    // Auto-unblock after duration
    setTimeout(() => {
      this.blockedIPs.delete(clientId);
    }, duration);

    this.logSecurityEvent({
      type: 'ip_blocked',
      clientId,
      duration,
      timestamp: Date.now()
    });
  }

  // Check if IP is blocked
  static isBlocked(clientId: string): boolean {
    return this.blockedIPs.has(clientId);
  }

  // Check if IP is suspicious
  static isSuspicious(clientId: string): boolean {
    return this.suspiciousIPs.has(clientId);
  }

  // Get security statistics
  static getStats(): {
    blockedIPs: number;
    suspiciousIPs: number;
    failedAttempts: number;
  } {
    return {
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      failedAttempts: Array.from(this.failedAttempts.values()).reduce((sum, count) => sum + count, 0)
    };
  }

  // Log security events
  private static logSecurityEvent(event: {
    type: string;
    clientId: string;
    timestamp: number;
    [key: string]: any;
  }): void {
    // In production, send to security monitoring service
    if (import.meta.env.PROD) {
      fetch('/api/security/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(() => {
        // Silent fail
      });
    } else {
      console.warn('Security Event:', event);
    }
  }
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance();
