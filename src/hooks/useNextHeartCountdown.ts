import { useEffect, useRef, useState } from 'react';
import { formatHeartCountdown, getMsUntilNextHeart } from '@/lib/heartRegen';

/** Har soniya qayta hisoblaydi; yuraklar to'liq bo'lsa null qaytaradi */
export function useNextHeartCountdown(hearts: number | undefined, heartsLastRegen: string | undefined) {
  const [, setTick] = useState(0);
  // Track when ms first hit 0 so we can stop showing "Tiklanmoqda..." after a timeout
  const zeroSinceRef = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => { setTick((t) => t + 1); }, 1000);
    return () => { window.clearInterval(id); };
  }, []);

  // Reset the zero-since tracker whenever hearts or regen timestamp changes
  useEffect(() => {
    zeroSinceRef.current = null;
  }, [hearts, heartsLastRegen]);

  if (hearts === undefined || hearts >= 5 || !heartsLastRegen) return null;

  const ms = getMsUntilNextHeart(hearts, heartsLastRegen);
  if (ms === null) return null;

  if (ms === 0) {
    // Record when we first hit zero
    if (zeroSinceRef.current === null) {
      zeroSinceRef.current = Date.now();
    }
    // Show "Tiklanmoqda..." for up to 8 seconds while waiting for the profile to refresh.
    // After that, hide the hint so the UI doesn't get stuck showing a stale message.
    const elapsed = Date.now() - zeroSinceRef.current;
    if (elapsed < 8000) {
      return { text: 'Tiklanmoqda...' };
    }
    return null;
  }

  // Timer is still counting down — reset the zero tracker
  zeroSinceRef.current = null;
  return { text: formatHeartCountdown(ms) };
}
