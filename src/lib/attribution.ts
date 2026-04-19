import { analytics } from '@/lib/analytics';

const SESSION_FLAG = 'mq_attr_tracked';

/**
 * Captures ?ref= and UTM params once per tab session for lightweight growth attribution.
 * First-touch is also stored in localStorage when present (survives return visits in same browser).
 */
export function captureAttributionFromUrl(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  const utm_source = params.get('utm_source');
  const utm_medium = params.get('utm_medium');
  const utm_campaign = params.get('utm_campaign');

  const hasParams = Boolean(ref || utm_source || utm_medium || utm_campaign);
  if (!hasParams) return;

  const payload = {
    ref,
    utm_source,
    utm_medium,
    utm_campaign,
    path: window.location.pathname,
  };

  try {
    sessionStorage.setItem(
      'mq_campaign',
      JSON.stringify({ ...payload, capturedAt: Date.now() })
    );
  } catch {
    /* quota / private mode */
  }

  if (!localStorage.getItem('mq_first_touch')) {
    try {
      localStorage.setItem(
        'mq_first_touch',
        JSON.stringify({ ...payload, capturedAt: Date.now() })
      );
    } catch {
      /* ignore */
    }
  }

  if (sessionStorage.getItem(SESSION_FLAG)) return;
  sessionStorage.setItem(SESSION_FLAG, '1');

  analytics.trackEvent('growth', 'campaign_params', window.location.pathname, undefined, payload);
}
