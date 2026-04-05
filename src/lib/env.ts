interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  VITE_APP_NAME?: string;
  VITE_APP_VERSION?: string;
}

const getRequiredEnv = (key: keyof EnvConfig): string => {
  const value = import.meta.env[key];
  if (!value?.trim()) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Please check your .env file or deployment configuration.`
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
};

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
