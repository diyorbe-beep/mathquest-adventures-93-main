import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

interface NumberLineQuestionProps {
  options: string[];
  onAnswer: (answer: string) => void;
  disabled: boolean;
}

const parseConfig = (options: string[]) => {
  const cfg: Record<string, number> = {};
  options.forEach((opt) => {
    const [k, v] = opt.split(':').map((s) => s.trim().toLowerCase());
    if (!k || v === undefined) return;
    const n = Number(v);
    if (!Number.isNaN(n)) cfg[k] = n;
  });
  return {
    min: cfg.min ?? 0,
    max: cfg.max ?? 12,
    step: cfg.step ?? 1,
  };
};

const NumberLineQuestion = ({ options, onAnswer, disabled }: NumberLineQuestionProps) => {
  const { min, max, step } = useMemo(() => parseConfig(options), [options]);
  const [value, setValue] = useState<number>(min);

  return (
    <div className="space-y-6">
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Son o‘qida tanlang</p>

      <div className="rounded-2xl border-2 border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>{min}</span>
          <span>{max}</span>
        </div>
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(vals) => { setValue(vals[0] ?? min); }}
          disabled={disabled}
        />
        <p className="mt-4 text-center text-lg font-black text-foreground">{value}</p>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => { onAnswer(String(value)); }}
        disabled={disabled}
        className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl disabled:opacity-50"
      >
        Javobni tekshirish ✨
      </motion.button>
    </div>
  );
};

export default NumberLineQuestion;
