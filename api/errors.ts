export const runtime = 'edge';

/**
 * Client-side error reporting sink (e.g. from ErrorBoundary). No PII persistence by default.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  // Reuse analytics ingest key if configured to prevent spam.
  const requiredKey = process.env.ANALYTICS_INGEST_KEY?.trim();
  const env = (process.env.VERCEL_ENV || process.env.NODE_ENV || '').toLowerCase();
  const isProd = env === 'production';
  if (requiredKey || isProd) {
    if (!requiredKey) {
      return Response.json({ error: 'Error ingest is not configured' }, { status: 503 });
    }
    const provided = request.headers.get('x-analytics-key')?.trim();
    if (!provided || provided !== requiredKey) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.includes('application/json')) {
    return Response.json({ error: 'Unsupported Media Type' }, { status: 415 });
  }

  const rawLen = request.headers.get('content-length');
  if (rawLen) {
    const n = Number(rawLen);
    if (Number.isFinite(n) && n > 64 * 1024) {
      return Response.json({ error: 'Payload Too Large' }, { status: 413 });
    }
  }
  try {
    await request.json();
  } catch {
    // ignore
  }
  return new Response(null, { status: 204 });
}
