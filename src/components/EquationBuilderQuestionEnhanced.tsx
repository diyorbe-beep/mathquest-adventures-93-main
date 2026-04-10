import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { QuestionVariationGenerator, AnswerVariation } from '@/lib/questionVariations';
import { toUzbekOption } from '@/lib/questionI18nEnhanced';

interface EquationBuilderQuestionProps {
  options: string[];
  correctAnswer: string;
  questionText: string;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  variations?: AnswerVariation[];
}

const EquationBuilderQuestion = ({ 
  options, 
  correctAnswer, 
  questionText, 
  onAnswer, 
  disabled,
  variations = []
}: EquationBuilderQuestionProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  
  // Generate variations if not provided
  const questionVariations = variations.length > 0 
    ? variations 
    : QuestionVariationGenerator.generateEquationVariations(
        correctAnswer,
        questionText
      );

  const toggleItem = (item: string) => {
    if (disabled) return;
    
    setSelectedItems(prev => {
      if (prev.includes(item)) {
        return prev.filter(i => i !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSubmit = () => {
    if (disabled || selectedItems.length === 0) return;
    
    const answer = selectedItems.join(',');
    
    // Check if answer matches any correct variation
    const isCorrect = questionVariations.some(variation => 
      variation.isCorrect && variation.text === answer
    );
    
    if (isCorrect) {
      onAnswer(answer);
    } else {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000);
    }
  };

  const clearSelection = () => {
    if (disabled) return;
    setSelectedItems([]);
  };

  const hasSelection = selectedItems.length > 0;

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
        Tenglama tuzish uchun elementlarni tanlang
      </p>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {options.map((option) => (
          <motion.button
            key={option}
            onClick={() => toggleItem(option)}
            disabled={disabled}
            className={`p-3 rounded-xl font-bold transition-all ${
              selectedItems.includes(option)
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-2 border-primary'
                : 'bg-card text-foreground shadow-md border-2 border-border hover:border-primary/20'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            {toUzbekOption(option)}
          </motion.button>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-muted border-2 border-border min-h-[60px] flex items-center justify-center">
        {selectedItems.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedItems.map((item, index) => (
              <motion.span
                key={`${item}-${index}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-lg font-bold"
              >
                {toUzbekOption(item)}
              </motion.span>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Elementlarni tanlang...
          </p>
        )}
      </div>

      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 rounded-lg bg-quest-yellow/10 border border-quest-yellow/20"
        >
          <p className="text-sm font-semibold text-quest-yellow">
            💡 Tenglama to\'g\'ri bo\'lishi kerak. Qayta urinib ko\'ring!
          </p>
        </motion.div>
      )}

      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={clearSelection}
          disabled={disabled || selectedItems.length === 0}
          className="flex-1 rounded-xl bg-muted py-3.5 font-bold text-muted-foreground border-2 border-border transition-all hover:bg-muted/80 disabled:opacity-50"
        >
          Tozalash 🗑️
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={disabled || !hasSelection}
          className="flex-1 rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl disabled:opacity-50"
        >
          Tenglamani tekshirish ✨
        </motion.button>
      </div>

      {/* Show variations count for debugging */}
      {process.env.NODE_ENV === 'development' && questionVariations.length > 1 && (
        <div className="p-2 rounded bg-gray-100 text-xs">
          <p>Tenglama variantlari: {questionVariations.length} ta</p>
        </div>
      )}
    </div>
  );
};

export default EquationBuilderQuestion;
