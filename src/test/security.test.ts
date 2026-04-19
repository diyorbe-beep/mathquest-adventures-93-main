/**
 * Security Tests
 * Comprehensive testing for security utilities and input validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  InputValidator, 
  sanitizeHtml, 
  sanitizeInput,
  CsrfProtection,
  RateLimiter,
  CspHelper,
  ApiSecurity
} from '@/lib/security';

describe('Input Validation', () => {
  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        const result = InputValidator.validateEmail(email);
        expect(result.valid).toBe(true);
        expect(result.message).toBeUndefined();
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example.',
        'test@example..com',
        '',
        null as any,
        undefined as any
      ];

      invalidEmails.forEach(email => {
        const result = InputValidator.validateEmail(email);
        expect(result.valid).toBe(false);
        expect(result.message).toBeDefined();
      });
    });

    it('should reject emails with dangerous content', () => {
      const dangerousEmails = [
        'test<script>alert("xss")@example.com',
        'test@example.com<script>',
        'test@example.com" onclick="alert(1)"'
      ];

      dangerousEmails.forEach(email => {
        const result = InputValidator.validateEmail(email);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('Username Validation', () => {
    it('should validate correct usernames', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'User_Name_123',
        'a1b2c3'
      ];

      validUsernames.forEach(username => {
        const result = InputValidator.validateUsername(username);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject invalid usernames', () => {
      const invalidUsernames = [
        'ab', // too short
        'user with spaces',
        'user@domain',
        'user#hash',
        'user!exclaim',
        '',
        null as any,
        undefined as any
      ];

      invalidUsernames.forEach(username => {
        const result = InputValidator.validateUsername(username);
        expect(result.valid).toBe(false);
      });
    });

    it('should reject reserved usernames', () => {
      const reservedUsernames = [
        'admin',
        'root',
        'system',
        'api',
        'www',
        'mail',
        'support',
        'ADMIN',
        'Admin'
      ];

      reservedUsernames.forEach(username => {
        const result = InputValidator.validateUsername(username);
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Foydalanuvchi nomi band qilingan');
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'StrongPass123!',
        'MySecureP@ssw0rd',
        'ComplexPassword123',
        'ValidPass_123'
      ];

      strongPasswords.forEach(password => {
        const result = InputValidator.validatePassword(password);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        '12345678', // common
        'password', // common
        'qwerty', // common
        'admin123', // common
        'password123', // common
        'short', // too short
        '',
        null as any,
        undefined as any
      ];

      weakPasswords.forEach(password => {
        const result = InputValidator.validatePassword(password);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('Number Validation', () => {
    it('should validate correct numbers', () => {
      const testCases = [
        { input: '123', options: {}, expected: 123 },
        { input: '45.67', options: {}, expected: 45.67 },
        { input: '-10', options: {}, expected: -10 },
        { input: '0', options: {}, expected: 0 }
      ];

      testCases.forEach(({ input, options, expected }) => {
        const result = InputValidator.validateNumber(input, options);
        expect(result.valid).toBe(true);
        expect(result.value).toBe(expected);
      });
    });

    it('should respect min/max constraints', () => {
      const minTest = InputValidator.validateNumber('5', { min: 10 });
      expect(minTest.valid).toBe(false);
      expect(minTest.message).toBe('Qiymat kamida 10 bo\'lishi kerak');

      const maxTest = InputValidator.validateNumber('15', { max: 10 });
      expect(maxTest.valid).toBe(false);
      expect(maxTest.message).toBe('Qiymat ko\'pi bilan 10 bo\'lishi kerak');
    });

    it('should validate integers when required', () => {
      const integerTest = InputValidator.validateNumber('12.5', { integer: true });
      expect(integerTest.valid).toBe(false);
      expect(integerTest.message).toBe('Butun son talab qilinadi');

      const validIntegerTest = InputValidator.validateNumber('12', { integer: true });
      expect(validIntegerTest.valid).toBe(true);
    });
  });

  describe('Text Validation', () => {
    it('should validate text with constraints', () => {
      const result = InputValidator.validateText('Hello World', {
        minLength: 5,
        maxLength: 20
      });
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Hello World');
    });

    it('should reject text that violates constraints', () => {
      const tooShort = InputValidator.validateText('Hi', { minLength: 5 });
      expect(tooShort.valid).toBe(false);

      const tooLong = InputValidator.validateText('This text is way too long', { maxLength: 10 });
      expect(tooLong.valid).toBe(false);
    });

    it('should sanitize dangerous content', () => {
      const dangerousText = 'Hello <script>alert("xss")</script> World';
      const result = InputValidator.validateText(dangerousText);
      expect(result.valid).toBe(true);
      expect(result.sanitized).not.toContain('<script>');
    });
  });

  describe('URL Validation', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test.org',
        'https://sub.domain.co.uk/path?query=1'
      ];

      validUrls.forEach(url => {
        const result = InputValidator.validateUrl(url);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        '',
        null as any
      ];

      invalidUrls.forEach(url => {
        const result = InputValidator.validateUrl(url);
        expect(result.valid).toBe(false);
      });
    });
  });
});

describe('XSS Protection', () => {
  it('should sanitize HTML content', () => {
    const dangerousInputs = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      '<a href="javascript:alert(1)">click</a>',
      '" onclick="alert(1)" ',
      "' onclick='alert(1)' ",
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    ];

    dangerousInputs.forEach((input) => {
      const sanitized = sanitizeHtml(input);
      expect(sanitized).not.toMatch(/<script/i);
      if (input.includes('<')) {
        expect(sanitized).toContain('&lt;');
        expect(sanitized).toContain('&gt;');
      }
    });
  });

  it('should remove dangerous characters from input', () => {
    const dangerousInput = 'test<script>alert(1)</script>"onclick=\'alert(1)\'';
    const sanitized = sanitizeInput(dangerousInput);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('onclick');
    expect(sanitized).not.toContain('"');
    expect(sanitized).not.toContain("'");
  });
});

describe('CSRF Protection', () => {
  beforeEach(() => {
    // Reset CSRF token
    CsrfProtection['token'] = null;
  });

  it('should generate and validate CSRF tokens', () => {
    const token = CsrfProtection.getToken();
    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThan(20);

    const isValid = CsrfProtection.validateToken(token);
    expect(isValid).toBe(true);
  });

  it('should reject invalid tokens', () => {
    const invalidToken = 'invalid-token';
    const isValid = CsrfProtection.validateToken(invalidToken);
    expect(isValid).toBe(false);
  });
});

describe('Rate Limiting', () => {
  beforeEach(() => {
    RateLimiter.reset('test-key');
  });

  it('should allow requests within limits', () => {
    for (let i = 0; i < 5; i++) {
      const allowed = RateLimiter.isAllowed('test-key', 10, 1000);
      expect(allowed).toBe(true);
    }
  });

  it('should block requests exceeding limits', () => {
    // Exhaust limit
    for (let i = 0; i < 10; i++) {
      RateLimiter.isAllowed('test-key', 5, 1000);
    }

    // Should be blocked
    const blocked = RateLimiter.isAllowed('test-key', 5, 1000);
    expect(blocked).toBe(false);
  });

  it('should reset after window expires', () => {
    // Exhaust limit
    for (let i = 0; i < 5; i++) {
      RateLimiter.isAllowed('test-key', 5, 50); // 50ms window
    }

    // Should be blocked
    const blocked = RateLimiter.isAllowed('test-key', 5, 50);
    expect(blocked).toBe(false);

    // Wait for window to expire (simulate with time travel)
    setTimeout(() => {
      // Should be allowed again
      const allowed = RateLimiter.isAllowed('test-key', 5, 50);
      expect(allowed).toBe(true);
    }, 60);
  });
});

describe('CSP Helper', () => {
  it('should generate nonces', () => {
    const nonce = CspHelper.generateNonce();
    expect(nonce).toBeDefined();
    expect(nonce.length).toBeGreaterThan(10);
  });

  it('should detect unsafe content', () => {
    const unsafeContent = [
      '<script>alert(1)</script>',
      'javascript:alert(1)',
      '<img onerror="alert(1)">',
      '<iframe src="evil.com">',
      '<object data="evil.swf">',
      '<embed src="evil.swf">',
      'vbscript:msgbox(1)',
      'data:text/html,<script>alert(1)</script>'
    ];

    unsafeContent.forEach(content => {
      const isSafe = CspHelper.isSafeContent(content);
      expect(isSafe).toBe(false);
    });

    const safeContent = [
      'Hello World',
      'This is safe content',
      '12345',
      'Regular text without HTML'
    ];

    safeContent.forEach(content => {
      const isSafe = CspHelper.isSafeContent(content);
      expect(isSafe).toBe(true);
    });
  });
});

describe('API Security', () => {
  describe('Purchase Request Validation', () => {
    it('should validate correct purchase requests', () => {
      const result = ApiSecurity.validatePurchaseRequest(
        'user1234567890abcdef',
        'item12345',
        5
      );
      expect(result.valid).toBe(true);
    });

    it('should reject invalid purchase requests', () => {
      const invalidRequests = [
        { userId: '', itemId: 'item12345', quantity: 5 },
        { userId: 'short', itemId: 'item12345', quantity: 5 },
        { userId: 'user1234567890abcdef', itemId: '', quantity: 5 },
        { userId: 'user1234567890abcdef', itemId: 'short', quantity: 5 },
        { userId: 'user1234567890abcdef', itemId: 'item12345', quantity: 0 },
        { userId: 'user1234567890abcdef', itemId: 'item12345', quantity: 101 }
      ];

      invalidRequests.forEach(({ userId, itemId, quantity }) => {
        const result = ApiSecurity.validatePurchaseRequest(userId, itemId, quantity);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('XP Request Validation', () => {
    it('should validate correct XP requests', () => {
      const result = ApiSecurity.validateXpRequest(
        'user1234567890abcdef',
        'lesson12345',
        10
      );
      expect(result.valid).toBe(true);
    });

    it('should reject invalid XP requests', () => {
      const invalidRequests = [
        { userId: '', lessonId: 'lesson12345', amount: 10 },
        { userId: 'short', lessonId: 'lesson12345', amount: 10 },
        { userId: 'user1234567890abcdef', lessonId: '', amount: 10 },
        { userId: 'user1234567890abcdef', lessonId: 'short', amount: 10 },
        { userId: 'user1234567890abcdef', lessonId: 'lesson12345', amount: 0 },
        { userId: 'user1234567890abcdef', lessonId: 'lesson12345', amount: 101 }
      ];

      invalidRequests.forEach(({ userId, lessonId, amount }) => {
        const result = ApiSecurity.validateXpRequest(userId, lessonId, amount);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize user input recursively', () => {
      const dangerousInput = {
        name: '<script>alert(1)</script>',
        email: 'test@example.com',
        profile: {
          bio: '<img onerror="alert(1)">',
          interests: ['<a href="javascript:alert(1)">link</a>', 'safe interest']
        }
      };

      const sanitized = ApiSecurity.sanitizeUserInput(dangerousInput);

      expect(sanitized.name).not.toContain('<script');
      expect(sanitized.profile.bio).toContain('&lt;img');
      expect(sanitized.profile.interests[0]).toContain('&lt;a');
      expect(sanitized.email).toBe('test@example.com'); // Should remain unchanged
    });
  });
});
