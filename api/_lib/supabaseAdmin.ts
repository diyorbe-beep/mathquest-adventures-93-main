import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase URL (Vercel / Node). Prefer SUPABASE_URL; fall back to VITE_* for compatibility.
 */
export function getSupabaseUrl(): string {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.VITE_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error('Missing SUPABASE_URL or VITE_SUPABASE_URL for API routes');
  }
  return url;
}

/**
 * Service role client — only import from `api/` handlers, never from client code.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = getSupabaseUrl();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (or fallback key) for API routes');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
