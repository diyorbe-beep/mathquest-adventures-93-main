import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface TypeAnswerQuestionProps {
  onAnswer: (answer: string) => void;
  disabled: boolean;
}

const TypeAnswerQuestion = ({ onAnswer, disabled }: TypeAnswerQuestionProps) => {
  const [value, setValue] = useState('');
  const normalized = value.trim();

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Javobni kiriting</p>

      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Javobni yozing..."
        inputMode="numeric"
        disabled={disabled}
        className="h-12 rounded-xl border-2 text-lg font-bold"
      />

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onAnswer(normalized)}
        disabled={disabled || normalized.length === 0}
        className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl disabled:opacity-50"
      >
        Javobni tekshirish ✨
      </motion.button>
    </div>
  );
};

export default TypeAnswerQuestion;
