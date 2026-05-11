import { getSupabaseAdmin } from '../_lib/supabaseAdmin';
import { enforceAllowedOrigins, enforceJsonBody, enforceMaxBodyBytes, requireAnalyticsKey } from '../_lib/analyticsGuard';

export const runtime = 'edge';

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const origin = enforceAllowedOrigins(request);
  if (origin) return origin;
  const auth = requireAnalyticsKey(request);
  if (auth) return auth;
  const ct = enforceJsonBody(request);
  if (ct) return ct;
  const size = enforceMaxBodyBytes(request, 64 * 1024);
  if (size) return size;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: true, accepted: 0, stored: false });
  }
  const n = Array.isArray(body) ? body.length : 1;
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from('analytics_ingest').insert({
      kind: 'events',
      item_count: n,
      payload: body as object,
    });
    if (error) throw error;
    return Response.json({ success: true, accepted: n, stored: true });
  } catch {
    return Response.json({ success: true, accepted: n, stored: false });
  }
}
