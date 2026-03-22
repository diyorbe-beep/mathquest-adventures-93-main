import { useNextHeartCountdown } from '@/hooks/useNextHeartCountdown';

type Props = {
  hearts: number;
  heartsLastRegen: string;
  className?: string;
};

/** Yuraklar 5 dan kam bo‘lsa, keyingi yurakka qolgan vaqtni ko‘rsatadi */
const HeartCountdownHint = ({ hearts, heartsLastRegen, className = '' }: Props) => {
  const countdown = useNextHeartCountdown(hearts, heartsLastRegen);
  if (!countdown) return null;

  return (
    <span
      className={`font-semibold text-muted-foreground tabular-nums whitespace-nowrap ${className}`}
      title="Keyingi yurak tiklanishigacha"
    >
      Keyingi: {countdown.text}
    </span>
  );
};

export default HeartCountdownHint;
