import { getSupabaseAdmin } from '../_lib/supabaseAdmin';

export const runtime = 'edge';

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const n = Array.isArray(body) ? body.length : 1;
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from('analytics_ingest').insert({
      kind: 'metrics',
      item_count: n,
      payload: (body ?? {}) as object,
    });
    if (error) throw error;
    return Response.json({ success: true, stored: true });
  } catch {
    return Response.json({ success: true, stored: false });
  }
}
