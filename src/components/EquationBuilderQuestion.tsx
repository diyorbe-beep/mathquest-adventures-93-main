import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toUzbekOption } from '@/lib/questionI18n';

interface EquationBuilderQuestionProps {
  options: string[];
  correctAnswer: string; // comma-separated expected tokens, e.g. "10,-,4"
  onAnswer: (answer: string) => void;
  disabled: boolean;
}

const EquationBuilderQuestion = ({ options, correctAnswer, onAnswer, disabled }: EquationBuilderQuestionProps) => {
  const expectedCount = useMemo(() => {
    const parts = correctAnswer
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
    return Math.max(parts.length, 1);
  }, [correctAnswer]);

  const [picked, setPicked] = useState<string[]>([]);

  const canSubmit = picked.length === expectedCount && !disabled;

  const removeAt = (idx: number) => {
    if (disabled) return;
    setPicked((prev) => prev.filter((_, i) => i !== idx));
  };

  const addToken = (token: string, idx: number) => {
    if (disabled || picked.length >= expectedCount) return;
    setPicked((prev) => [...prev, `${token}__${idx}__${Date.now()}`]);
  };

  const renderToken = (raw: string) => raw.split('__')[0] ?? raw;

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Bo‘sh joylarni to‘ldiring</p>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: expectedCount }).map((_, idx) => {
          const value = picked[idx];
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (value) removeAt(idx);
              }}
              disabled={!value || disabled}
              className={`h-12 rounded-xl border-2 text-center text-lg font-black transition-colors ${
                value ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground'
              }`}
            >
              {value ? toUzbekOption(renderToken(value)) : '?'}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {options.map((token, i) => (
          <motion.button
            key={`${token}-${i}`}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => { addToken(token, i); }}
            disabled={disabled || picked.length >= expectedCount}
            className="rounded-xl border-2 border-border bg-card px-3 py-3 text-base font-bold text-foreground transition-colors hover:border-primary/40 disabled:opacity-50"
          >
            {toUzbekOption(token)}
          </motion.button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => { onAnswer(picked.map(renderToken).join(',')); }}
        disabled={!canSubmit}
        className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl disabled:opacity-50"
      >
        Javobni tekshirish ✨
      </motion.button>
    </div>
  );
};

export default EquationBuilderQuestion;
