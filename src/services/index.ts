// Service layer for business logic
export class UserService {
  static async getUserProfile(userId: string) {
    // Centralized user profile logic
    const response = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return response.json();
  }
  
  static async updateUserStats(userId: string, stats: any) {
    // Centralized user stats updates
    const response = await fetch('/api/user/stats', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, stats })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user stats');
    }
    
    return response.json();
  }
}

export class ShopService {
  static async getShopItems(category?: string) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    
    const response = await fetch(`/api/shop/items?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch shop items');
    }
    
    return response.json();
  }
  
  static async purchaseItem(userId: string, itemId: string, quantity: number) {
    const response = await fetch('/api/shop/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, itemId, quantity })
    });
    
    if (!response.ok) {
      throw new Error('Failed to purchase item');
    }
    
    return response.json();
  }
}

export class LessonService {
  static async getLessonProgress(userId: string, lessonId: string) {
    const response = await fetch(`/api/lessons/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, lessonId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get lesson progress');
    }
    
    return response.json();
  }
  
  static async updateLessonProgress(userId: string, lessonId: string, progress: any) {
    const response = await fetch('/api/lessons/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, lessonId, progress })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update lesson progress');
    }
    
    return response.json();
  }
  
  static async awardXP(userId: string, lessonId: string, amount: number, source: string) {
    const response = await fetch('/api/lessons/award-xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, lessonId, amount, source })
    });
    
    if (!response.ok) {
      throw new Error('Failed to award XP');
    }
    
    return response.json();
  }
}

export class AnalyticsService {
  static async trackEvent(userId: string, event: string, data: any) {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, event, data, timestamp: new Date().toISOString() })
    });
    
    if (!response.ok) {
      console.error('Failed to track analytics event');
    }
    
    return response.json();
  }
  
  static async getUserAnalytics(userId: string, timeframe: string) {
    const response = await fetch(`/api/analytics/user/${userId}?timeframe=${timeframe}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user analytics');
    }
    
    return response.json();
  }
}

// Utility functions for common operations
export class ValidationUtils {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }
}

export class DateUtils {
  static formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  static formatTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : Date;
    return d.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  static getRelativeTime(date: string | Date): string {
    const now = new Date();
    const target = typeof date === 'string' ? new Date(date) : Date;
    const diffMs = now.getTime() - target.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} kun oldin`;
    } else if (diffHours > 0) {
      return `${diffHours} soat oldin`;
    } else {
      return 'hozir';
    }
  }
}
