interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  VITE_APP_NAME?: string;
  VITE_APP_VERSION?: string;
  /** To‘liq sayt URL (masalan https://mathquest.uz) — og:image va og:url uchun */
  VITE_SITE_URL?: string;
}

const getRequiredEnv = (key: keyof EnvConfig): string => {
  const value = import.meta.env[key];
  if (!value?.trim()) {
    throw new Error(
      `Talab qilinadigan muhit o'zgaruvchisi topilmadi: ${key}. ` +
        `.env faylingizni yoki deployment konfiguratsiyangizni tekshiring.`
    );
  }
  return value;
};

const getOptionalEnv = (key: keyof EnvConfig, defaultValue: string = ''): string => {
  return import.meta.env[key]?.trim() || defaultValue;
};

export const env: EnvConfig = {
  VITE_SUPABASE_URL: getRequiredEnv('VITE_SUPABASE_URL'),
  VITE_SUPABASE_PUBLISHABLE_KEY: getRequiredEnv('VITE_SUPABASE_PUBLISHABLE_KEY'),
  VITE_APP_NAME: getOptionalEnv('VITE_APP_NAME', 'MathQuest'),
  VITE_APP_VERSION: getOptionalEnv('VITE_APP_VERSION', '1.0.0'),
  VITE_SITE_URL: getOptionalEnv('VITE_SITE_URL', ''),
};

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Validate Supabase URL format (allows custom domains and local Supabase)
export const validateSupabaseConfig = () => {
  try {
    const url = new URL(env.VITE_SUPABASE_URL);
    const host = url.hostname.toLowerCase();
    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.local');
    if (!isLocal && url.protocol !== 'https:') {
      throw new Error('Production Supabase URL HTTPS bo\'lishi kerak');
    }
    
    // Log only in development
    if (import.meta.env.DEV) {
      console.log('Supabase config validated:', { 
        url: env.VITE_SUPABASE_URL.replace(/key=.*/, 'key=***'),
        hostname: url.hostname 
      });
    }
    
    return true;
  } catch (err) {
    // Use proper error handling
    if (import.meta.env.DEV) {
      console.error('Supabase config validation failed:', err);
    }
    // In production, send to error tracking
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service
      console.error('Critical: Supabase config validation failed');
    }
    return false;
  }
};
