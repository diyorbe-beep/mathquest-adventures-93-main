/**
 * Comprehensive Security Utilities
 * Provides input validation, XSS protection, and security helpers
 */

// XSS Protection - Sanitize HTML content
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Remove potentially dangerous characters
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove HTML special chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
};

// Enhanced input validation
export class InputValidator {
  // Email validation with stricter rules
  static validateEmail(email: string): { valid: boolean; message?: string } {
    if (!email || typeof email !== 'string') {
      return { valid: false, message: 'Email talab qilinadi' };
    }

    const trimmed = email.trim();
    // Reject characters that are never valid in RFC5322 mailbox / common safe subset
    if (/[^a-zA-Z0-9@._%+-]/.test(trimmed)) {
      return { valid: false, message: 'Noto\'g\'ri email formati' };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, message: 'Noto\'g\'ri email formati' };
    }

    const atParts = trimmed.split('@');
    if (atParts.length !== 2) {
      return { valid: false, message: 'Noto\'g\'ri email formati' };
    }
    const [local, domain] = atParts;
    if (!local || !domain || local.includes('..') || domain.includes('..')) {
      return { valid: false, message: 'Noto\'g\'ri email formati' };
    }
    if (domain.startsWith('.') || domain.endsWith('.')) {
      return { valid: false, message: 'Noto\'g\'ri email formati' };
    }

    if (trimmed.length > 254) {
      return { valid: false, message: 'Email juda uzun' };
    }

    return { valid: true };
  }

  // Username validation with security checks
  static validateUsername(username: string): { valid: boolean; message?: string } {
    if (!username || typeof username !== 'string') {
      return { valid: false, message: 'Foydalanuvchi nomi talab qilinadi' };
    }

    const sanitized = sanitizeInput(username);
    
    if (sanitized.length < 3) {
      return { valid: false, message: 'Foydalanuvchi nomi kamida 3 ta belgidan iborat bo\'lishi kerak' };
    }

    if (sanitized.length > 20) {
      return { valid: false, message: 'Foydalanuvchi nomi 20 ta belgidan kam bo\'lishi kerak' };
    }

    // Only allow alphanumeric and underscore
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(sanitized)) {
      return { valid: false, message: 'Foydalanuvchi nomi faqat harflar, raqamlar va pastki chiziqlarni o\'z ichiga oladi' };
    }

    // Prevent reserved usernames
    const reserved = ['admin', 'root', 'system', 'api', 'www', 'mail', 'support'];
    if (reserved.includes(sanitized.toLowerCase())) {
      return { valid: false, message: 'Foydalanuvchi nomi band qilingan' };
    }

    return { valid: true };
  }

  // Password strength validation
  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password || typeof password !== 'string') {
      return { valid: false, message: 'Parol talab qilinadi' };
    }

    if (password.length < 8) {
      return { valid: false, message: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak' };
    }

    if (password.length > 128) {
      return { valid: false, message: 'Parol juda uzun' };
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '12345678', 'qwerty', 'admin123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      return { valid: false, message: 'Parol juda ommabop' };
    }

    return { valid: true };
  }

  // Numeric input validation
  static validateNumber(input: string, options: {
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}): { valid: boolean; message?: string; value?: number } {
    const { min, max, integer = false } = options;
    
    if (!input || typeof input !== 'string') {
      return { valid: false, message: 'Son talab qilinadi' };
    }

    const sanitized = sanitizeInput(input);
    const num = parseFloat(sanitized);

    if (!Number.isFinite(num)) {
      return { valid: false, message: 'Noto\'g\'ri son formati' };
    }

    if (integer && !Number.isInteger(num)) {
      return { valid: false, message: 'Butun son talab qilinadi' };
    }

    if (min !== undefined && num < min) {
      return { valid: false, message: `Qiymat kamida ${min} bo\'lishi kerak` };
    }

    if (max !== undefined && num > max) {
      return { valid: false, message: `Qiymat ko\'pi bilan ${max} bo\'lishi kerak` };
    }

    return { valid: true, value: num };
  }

  // Text input validation
  static validateText(input: string, options: {
    minLength?: number;
    maxLength?: number;
    allowEmpty?: boolean;
    pattern?: RegExp;
  } = {}): { valid: boolean; message?: string; sanitized?: string } {
    const { minLength = 0, maxLength = 1000, allowEmpty = false, pattern } = options;
    
    if (typeof input !== 'string') {
      return { valid: false, message: 'Noto\'g\'ri kiritish turi' };
    }

    const sanitized = sanitizeInput(input);

    if (!allowEmpty && sanitized.length === 0) {
      return { valid: false, message: 'Maydon bo\'sh bo\'lishi mumkin emas' };
    }

    if (sanitized.length < minLength) {
      return { valid: false, message: `Kamida ${minLength} ta belgi bo\'lishi kerak` };
    }

    if (sanitized.length > maxLength) {
      return { valid: false, message: `Ko\'pi bilan ${maxLength} ta belgi bo\'lishi kerak` };
    }

    if (pattern && !pattern.test(sanitized)) {
      return { valid: false, message: 'Noto\'g\'ri format' };
    }

    return { valid: true, sanitized };
  }

  // URL validation
  static validateUrl(url: string): { valid: boolean; message?: string; sanitized?: string } {
    if (!url || typeof url !== 'string') {
      return { valid: false, message: 'URL talab qilinadi' };
    }

    const sanitized = sanitizeInput(url);
    
    try {
      const urlObj = new URL(sanitized);
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, message: 'Faqat HTTP va HTTPS URL larga ruxsat beriladi' };
      }

      if (sanitized.toLowerCase().includes('javascript:') || 
          sanitized.toLowerCase().includes('data:')) {
        return { valid: false, message: 'Noto\'g\'ri URL protokoli' };
      }

      return { valid: true, sanitized };
    } catch {
      return { valid: false, message: 'Noto\'g\'ri URL formati' };
    }
  }
}

// CSRF Protection
export class CsrfProtection {
  private static token: string | null = null;

  // Generate CSRF token
  static generateToken(): string {
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback for older browsers
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Get or create CSRF token
  static getToken(): string {
    if (!this.token) {
      this.token = this.generateToken();
      // Store in session storage
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('csrf_token', this.token);
      }
    }
    return this.token;
  }

  // Validate CSRF token
  static validateToken(token: string): boolean {
    const storedToken = typeof window !== 'undefined' && window.sessionStorage 
      ? window.sessionStorage.getItem('csrf_token') 
      : null;
    
    return storedToken === token;
  }

  // Add CSRF token to form data
  static addToFormData(formData: FormData): void {
    formData.append('csrf_token', this.getToken());
  }

  // Add CSRF token to headers
  static addToHeaders(headers: Record<string, string>): void {
    headers['X-CSRF-Token'] = this.getToken();
  }
}

// Content Security Policy helper
export class CspHelper {
  // Generate nonce for inline scripts
  static generateNonce(): string {
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint8Array(16);
      window.crypto.getRandomValues(array);
      return btoa(String.fromCharCode(...array));
    }
    
    // Fallback
    return Math.random().toString(36).substring(2, 15);
  }

  // Check if content is safe for display
  static isSafeContent(content: string): boolean {
    if (!content || typeof content !== 'string') {
      return false;
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /vbscript:/i,
      /data:text\/html/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(content));
  }
}

// Rate limiting (client-side)
export class RateLimiter {
  private static attempts = new Map<string, { count: number; lastAttempt: number }>();

  static isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if window has passed
    if (now - record.lastAttempt > windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if limit exceeded
    if (record.count >= maxAttempts) {
      return false;
    }

    // Increment count
    record.count++;
    record.lastAttempt = now;
    return true;
  }

  static reset(key: string): void {
    this.attempts.delete(key);
  }
}

// API Security class for server-side operations
export class ApiSecurity {
  static validatePurchaseRequest(userId: string, itemId: string, quantity: number): { valid: boolean; error?: string } {
    // Validate user ID format
    if (!userId || typeof userId !== 'string' || userId.length < 10) {
      return { valid: false, error: 'Noto\'g\'ri foydalanuvchi ID' };
    }

    // Validate item ID (UUID / opaque id — short strings are invalid)
    if (!itemId || typeof itemId !== 'string' || itemId.length < 8) {
      return { valid: false, error: 'Noto\'g\'ri mahsulot ID' };
    }

    // Validate quantity
    const quantityResult = InputValidator.validateNumber(quantity.toString(), {
      min: 1,
      max: 100,
      integer: true
    });

    if (!quantityResult.valid) {
      return { valid: false, error: quantityResult.message };
    }

    // Rate limiting check
    const rateLimitKey = `purchase_${userId}`;
    if (!RateLimiter.isAllowed(rateLimitKey, 5, 60000)) { // 5 purchases per minute
      return { valid: false, error: 'Juda ko\'p xarid urinishlari' };
    }

    return { valid: true };
  }

  static validateXpRequest(userId: string, lessonId: string, amount: number): { valid: boolean; error?: string } {
    // Validate user ID
    if (!userId || typeof userId !== 'string' || userId.length < 10) {
      return { valid: false, error: 'Noto\'g\'ri foydalanuvchi ID' };
    }

    if (!lessonId || typeof lessonId !== 'string' || lessonId.length < 8) {
      return { valid: false, error: 'Noto\'g\'ri dars ID' };
    }

    // Validate XP amount
    const amountResult = InputValidator.validateNumber(amount.toString(), {
      min: 1,
      max: 100,
      integer: true
    });

    if (!amountResult.valid) {
      return { valid: false, error: amountResult.message };
    }

    // Rate limiting check
    const rateLimitKey = `xp_${userId}`;
    if (!RateLimiter.isAllowed(rateLimitKey, 20, 60000)) { // 20 XP awards per minute
      return { valid: false, error: 'Juda ko\'p XP so\'rovlari' };
    }

    return { valid: true };
  }

  static sanitizeUserInput(input: any): any {
    if (typeof input === 'string') {
      return sanitizeHtml(input);
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeUserInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[sanitizeHtml(key)] = this.sanitizeUserInput(value);
      }
      return sanitized;
    }

    return input;
  }

  static addSecurityHeaders(headers: Record<string, string>): Record<string, string> {
    return {
      ...headers,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }
}

// Security headers for API requests
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'nonce-{{nonce}}'; style-src 'self' 'unsafe-inline';"
};
