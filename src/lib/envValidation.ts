/**
 * Environment Validation Utilities
 * Ensures proper environment configuration and prevents common issues
 */

interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  VITE_APP_NAME?: string;
  VITE_APP_VERSION?: string;
  VITE_DEV_MODE?: string;
}

export class EnvValidator {
  /**
   * Validate environment configuration
   */
  static validate(): EnvConfig & { errors: string[] } {
    const errors: string[] = [];
    const config: Partial<EnvConfig> = {};

    // Validate required Supabase variables
    if (!import.meta.env.VITE_SUPABASE_URL) {
      errors.push('VITE_SUPABASE_URL talab qilinadi');
    } else {
      config.VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      
      // Check URL format
      try {
        const url = new URL(config.VITE_SUPABASE_URL);
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.push('VITE_SUPABASE_URL faqat HTTP yoki HTTPS protocol talab qiladi');
        }
        
        // Check if it's a Supabase URL
        if (!url.hostname.includes('.supabase.co')) {
          errors.push('VITE_SUPABASE_URL Supabase URL bo\'lishi kerak');
        }
      } catch {
        errors.push('VITE_SUPABASE_URL noto\'g\'ri URL format');
      }
    }

    if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
      errors.push('VITE_SUPABASE_PUBLISHABLE_KEY talab qilinadi');
    } else {
      config.VITE_SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    }

    // Optional values
    config.VITE_APP_NAME = import.meta.env.VITE_APP_NAME || 'MathQuest';
    config.VITE_APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
    config.VITE_DEV_MODE = import.meta.env.DEV ? 'true' : 'false';

    return {
      config: config as EnvConfig,
      errors
    };
  }

  /**
   * Get environment-specific configuration
   */
  static getEnvConfig(): EnvConfig {
    const { config, errors } = this.validate();
    
    if (errors.length > 0) {
      console.error('Environment xatolari:', errors);
      throw new Error(`Environment konfiguratsiyasi xato: ${errors.join(', ')}`);
    }

    // Log environment in development
    if (config.VITE_DEV_MODE === 'true') {
      console.log('Development mode enabled');
      console.log('Supabase URL:', config.VITE_SUPABASE_URL);
      console.log('App Name:', config.VITE_APP_NAME);
    }

    return config;
  }

  /**
   * Check if running in development
   */
  static isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  /**
   * Check if running in production
   */
  static isProduction(): boolean {
    return import.meta.env.PROD;
  }

  /**
   * Get Supabase client configuration
   */
  static getSupabaseConfig() {
    const config = this.getEnvConfig();
    
    return {
      url: config.VITE_SUPABASE_URL,
      key: config.VITE_SUPABASE_PUBLISHABLE_KEY,
      options: {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        }
      }
    };
  }
}

export default EnvValidator;
