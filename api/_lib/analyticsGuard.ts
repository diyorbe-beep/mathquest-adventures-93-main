export function requireAnalyticsKey(request: Request): Response | null {
  const requiredKey = process.env.ANALYTICS_INGEST_KEY?.trim();
  const env = (process.env.VERCEL_ENV || process.env.NODE_ENV || '').toLowerCase();
  const isProd = env === 'production';

  // If no key is configured, allow in non-prod to keep local/dev friction low.
  if (!requiredKey && !isProd) return null;

  if (!requiredKey) {
    return Response.json({ error: 'Analytics ingest is not configured' }, { status: 503 });
  }

  const provided = request.headers.get('x-analytics-key')?.trim();
  if (!provided || provided !== requiredKey) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

export function enforceJsonBody(request: Request): Response | null {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  // Allow common "application/json; charset=utf-8"
  if (!contentType.includes('application/json')) {
    return Response.json({ error: 'Unsupported Media Type' }, { status: 415 });
  }
  return null;
}

export function enforceMaxBodyBytes(request: Request, maxBytes: number): Response | null {
  const raw = request.headers.get('content-length');
  if (!raw) return null; // Some platforms omit it; best-effort only.
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  if (n > maxBytes) {
    return Response.json({ error: 'Payload Too Large' }, { status: 413 });
  }
  return null;
}

export function enforceAllowedOrigins(request: Request): Response | null {
  const env = (process.env.VERCEL_ENV || process.env.NODE_ENV || '').toLowerCase();
  const isProd = env === 'production';
  if (!isProd) return null;

  const allowList = (process.env.ANALYTICS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowList.length === 0) return null;

  const origin = request.headers.get('origin')?.trim();
  if (!origin) return Response.json({ error: 'Missing Origin' }, { status: 400 });
  if (!allowList.includes(origin)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

