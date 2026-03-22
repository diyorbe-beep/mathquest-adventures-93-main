import { useEffect, useState } from 'react';
import { formatHeartCountdown, getMsUntilNextHeart } from '@/lib/heartRegen';

/** Har soniya qayta hisoblaydi; yuraklar to‘liq bo‘lsa null */
export function useNextHeartCountdown(hearts: number | undefined, heartsLastRegen: string | undefined) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (hearts === undefined || !heartsLastRegen) return null;
  const ms = getMsUntilNextHeart(hearts, heartsLastRegen);
  if (ms === null) return null;
  if (ms === 0) return { text: 'Hozir' };
  return { text: formatHeartCountdown(ms) };
}
