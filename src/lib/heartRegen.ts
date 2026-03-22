/** Server bilan mos: har soatda 1 yurak, `regenerateHearts` yangilaganda vaqt nuqta sifatida qayta boshlanadi */
export const HEART_REGEN_MS = 60 * 60 * 1000;

export function getMsUntilNextHeart(hearts: number, heartsLastRegenIso: string): number | null {
  if (hearts >= 5) return null;
  const last = new Date(heartsLastRegenIso).getTime();
  if (Number.isNaN(last)) return null;
  return Math.max(0, last + HEART_REGEN_MS - Date.now());
}

export function formatHeartCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
