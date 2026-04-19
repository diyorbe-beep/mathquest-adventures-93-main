import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { QuestionVariationGenerator, AnswerVariation } from '@/lib/questionVariations';

interface TypeAnswerQuestionProps {
  onAnswer: (answer: string) => void;
  disabled: boolean;
  variations?: AnswerVariation[];
  questionText: string;
  correctAnswer: string;
}

const TypeAnswerQuestion = ({ 
  onAnswer, 
  disabled, 
  variations = [], 
  questionText,
  correctAnswer 
}: TypeAnswerQuestionProps) => {
  const [value, setValue] = useState('');
  const [showHint, setShowHint] = useState(false);
  const normalized = value.trim();

  // Generate variations if not provided
  const questionVariations = variations.length > 0 
    ? variations 
    : QuestionVariationGenerator.generateMultipleChoiceVariations(
        correctAnswer,
        questionText,
        1
      );

  // Filter correct variations
  const correctVariations = questionVariations.filter(v => v.isCorrect);
  
  const handleSubmit = () => {
    if (disabled || normalized.length === 0) return;
    
    // Check if answer matches any correct variation
    const isCorrect = correctVariations.some(variation => 
      variation.text.toLowerCase().trim() === normalized.toLowerCase()
    );
    
    if (isCorrect) {
      onAnswer(normalized);
    } else {
      // Show hint if wrong
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
        Javobni kiriting
      </p>

      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Javobni yozing..."
        inputMode="numeric"
        disabled={disabled}
        className="h-12 rounded-xl border-2 text-lg font-bold"
      />

      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 rounded-lg bg-quest-yellow/10 border border-quest-yellow/20"
        >
          <p className="text-sm font-semibold text-quest-yellow">
            💡 Qayta o'ylab ko'ring! Hisoblashni tekshiring.
          </p>
        </motion.div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        disabled={disabled || normalized.length === 0}
        className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl disabled:opacity-50"
      >
        Javobni tekshirish ✨
      </motion.button>

    </div>
  );
};

export default TypeAnswerQuestion;
