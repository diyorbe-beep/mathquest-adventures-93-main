import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { env } from '@/lib/env';

const BASE = 'MathQuest';

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

const titles: Record<string, string> = {
  '/': `${BASE} — Matematika sarguzashti`,
  '/auth': `Kirish — ${BASE}`,
  '/dashboard': `Boshqaruv paneli — ${BASE}`,
  '/map': `Mavzu xaritasi — ${BASE}`,
  '/leaderboard': `Reyting — ${BASE}`,
  '/achievements': `Yutuqlar — ${BASE}`,
  '/profile': `Profil — ${BASE}`,
  '/parent-stats': `Ota-ona statistikasi — ${BASE}`,
  '/shop': `Do'kon — ${BASE}`,
  '/orders': `Buyurtmalar — ${BASE}`,
  '/review': `Takrorlash — ${BASE}`,
  '/diagnostic': `Diagnostika — ${BASE}`,
  '/admin': `Admin — ${BASE}`,
};

/**
 * Syncs document.title with the current route for SEO and UX (tab titles).
 */
export function DocumentHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const exact = titles[pathname];
    if (exact) {
      document.title = exact;
    } else if (pathname.startsWith('/topic/')) {
      document.title = `Mavzu — ${BASE}`;
    } else if (pathname.startsWith('/lesson/')) {
      document.title = `Dars — ${BASE}`;
    } else {
      document.title = BASE;
    }

    const site = env.VITE_SITE_URL?.replace(/\/$/, '');
    if (site) {
      try {
        const canonical = new URL(pathname, `${site}/`).href;
        setMetaProperty('og:url', canonical);
        setMetaProperty('og:image', `${site}/favicon.svg`);
        setMetaName('twitter:image', `${site}/favicon.svg`);
      } catch {
        /* invalid VITE_SITE_URL */
      }
    }
  }, [pathname]);

  return null;
}
