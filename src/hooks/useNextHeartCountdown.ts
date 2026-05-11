import { useEffect, useState } from 'react';
import { formatHeartCountdown, getMsUntilNextHeart } from '@/lib/heartRegen';

/** Har soniya qayta hisoblaydi; yuraklar to‘liq bo‘lsa null */
export function useNextHeartCountdown(hearts: number | undefined, heartsLastRegen: string | undefined) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => { setTick((t) => t + 1); }, 1000);
    return () => { window.clearInterval(id); };
  }, []);

  if (hearts === undefined || !heartsLastRegen) return null;
  const ms = getMsUntilNextHeart(hearts, heartsLastRegen);
  if (ms === null) return null;
  // When countdown reaches 0, the app should be regenerating on the backend.
  // Showing "Hozir" tends to get stuck if the profile refresh is delayed.
  if (ms === 0) return { text: 'Tiklanmoqda...' };
  return { text: formatHeartCountdown(ms) };
}
