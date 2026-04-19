export const runtime = 'edge';

/**
 * Client-side error reporting sink (e.g. from ErrorBoundary). No PII persistence by default.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  try {
    await request.json();
  } catch {
    // ignore
  }
  return new Response(null, { status: 204 });
}
