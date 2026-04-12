// Secure API endpoints for server-side operations
// All sensitive operations now go through server API routes

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Secure operations using API endpoints
export class SecureOperations {
  static async purchaseItem(userId: string, itemId: string, quantity: number = 1): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/secure/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          userId,
          itemId,
          quantity,
          idempotencyKey: `purchase_${userId}_${itemId}_${Date.now()}`
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Xarid amalga oshmadi');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Xarid amalga oshmadi'
      };
    }
  }
  
  static async awardXP(userId: string, lessonId: string, amount: number, source: string = 'lesson'): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/secure/award-xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          userId,
          lessonId,
          amount,
          source
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'XP berish amalga oshmadi');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'XP berish amalga oshmadi'
      };
    }
  }
  
  static async awardCoins(userId: string, amount: number, source: string = 'lesson', lessonId?: string): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/secure/award-coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          userId,
          amount,
          source,
          lessonId
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Coin berish muvaffaqatsiz');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Coin berish muvaffaqatsiz'
      };
    }
  }
  
  static async validateUserProgress(userId: string, lessonId: string): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/secure/validate-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          userId,
          lessonId
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Taraqqiyotni tekshirib bo\'lmadi');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Taraqqiyotni tekshirib bo\'lmadi'
      };
    }
  }
  
  static async logActivity(userId: string, action: string, metadata: any = {}): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/secure/log-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          userId,
          action,
          metadata
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Faollikni qayd etib bo\'lmadi');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Faollikni qayd etib bo\'lmadi'
      };
    }
  }
  
    
  static async getUserStats(userId: string): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/secure/user-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          userId
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Foydalanuvchi statistikasini olish muvaffaqiyatsiz');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Foydalanuvchi statistikasini olish muvaffaqiyatsiz'
      };
    }
  }

  private static async getAuthToken(): Promise<string> {
    // Get current session token from Supabase auth
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Autentifikatsiya tokeni mavjud emas');
    }
    
    return session.access_token;
  }
}

// Import enhanced security utilities
import { InputValidator as EnhancedInputValidator } from '@/lib/security';

// Re-export enhanced validator for backward compatibility
export const InputValidator = EnhancedInputValidator;

// Error handling utilities
export class ErrorHandler {
  static handleDatabaseError(error: any): { message: string; code?: string } {
    if (error?.code === '23505') {
      return { message: 'Foydalanuvchi nomi allaqachon mavjud', code: 'DUPLICATE_USERNAME' };
    }
    
    if (error?.code === '23514') {
      return { message: 'Noto\'g\'ri kirish ma\'lumotlari', code: 'INVALID_INPUT' };
    }
    
    if (error?.code === '42501') {
      return { message: 'Ruxsat berilmadi', code: 'PERMISSION_DENIED' };
    }
    
    return { message: error?.message || 'Xato yuz berdi', code: error?.code };
  }
  
  static logError(error: any, context: string = ''): void {
    // Use proper logging service instead of console
    if (import.meta.env.DEV) {
      console.error(`[${context}] Xato:`, {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        stack: error?.stack,
        timestamp: new Date().toISOString()
      });
    } else {
      // In production, send to error tracking
      this.sendToErrorService(error, context);
    }
  }

  private static sendToErrorService(error: any, context: string): void {
    // TODO: Implement Sentry or other error tracking service
    // For now, we'll use a fallback logging mechanism
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message: error?.message,
            stack: error?.stack,
            code: error?.code
          },
          context,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(() => {
        // Silent fail - don't throw in error handler
      });
    } catch {
      // Silent fail
    }
  }
}
