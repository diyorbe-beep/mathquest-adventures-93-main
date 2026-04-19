import { getSupabaseAdmin } from '../_lib/supabaseAdmin';

export const runtime = 'edge';

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
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
