import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { toUzbekOption } from '@/lib/questionI18nEnhanced';
import { isDragDropSelectMode } from '@/lib/dragDropSelectMode';
import type { AnswerVariation } from '@/lib/questionVariations';

interface DragDropQuestionProps {
  options: string[];
  correctAnswer: string;
  questionText: string;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  variations?: AnswerVariation[];
}

const DragDropQuestion = ({ 
  options, 
  correctAnswer, 
  questionText, 
  onAnswer, 
  disabled,
  variations: _variations = []
}: DragDropQuestionProps) => {
  const [items, setItems] = useState(options);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [hintOpen, setHintOpen] = useState(false);

  // Determine mode: if correct answer length < options length, it's a "select" mode
  // Otherwise it's an "order" mode
  const isSelectMode = isDragDropSelectMode(questionText, correctAnswer, options.length);
  const isOrderMode = !isSelectMode;

  const toggleSelect = (item: string) => {
    if (disabled) return;
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = () => {
    if (disabled) return;
    
    // Sort selected items for order-independent comparison if in select mode
    const answer = isSelectMode 
      ? selectedItems.sort().join(',')
      : items.join(',');
    
    // Always call onAnswer, don't block.
    // The parent (LessonPage) will handle heart deduction and feedback.
    onAnswer(answer);
  };

  const hasSelection = isSelectMode ? selectedItems.length > 0 : true;

  return (
    <div className="space-y-4">
      {isOrderMode ? (
        <div>
          <p className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Tartiblash uchun surib qo'ying
          </p>
          <Reorder.Group axis="y" values={items} onReorder={disabled ? () => {} : setItems} className="space-y-2">
            {items.map((item) => (
              <Reorder.Item
                key={item}
                value={item}
                className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-lg border-2 border-border hover:border-primary/20 transition-colors cursor-grab active:cursor-grabbing"
                whileDrag={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
              >
                <span className="text-lg font-bold text-foreground">
                  {toUzbekOption(item)}
                </span>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      ) : (
        <div>
          <p className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            To'g'ri javoblarni tanlang
          </p>
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <motion.button
                key={item}
                onClick={() => toggleSelect(item)}
                disabled={disabled}
                className={`p-4 rounded-xl font-bold transition-all ${
                  selectedItems.includes(item)
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-2 border-primary'
                    : 'bg-card text-foreground shadow-md border-2 border-border hover:border-primary/20'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {toUzbekOption(item)}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setHintOpen((h) => !h)}
          className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
        >
          💡 Maslahat
        </button>
      </div>

      {hintOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-lg border border-quest-yellow/20 bg-quest-yellow/10 p-3"
        >
          <p className="text-sm font-semibold text-quest-yellow">
            {isOrderMode
              ? "Elementlarni to'g'ri tartibda joylashtiring!"
              : "Faqat to'g'ri javoblarni tanlang!"}
          </p>
        </motion.div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        disabled={disabled || !hasSelection}
        className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl disabled:opacity-50"
      >
        {isOrderMode ? 'Tartibni tekshirish' : 'Tanlovni tekshirish'} ✨
      </motion.button>

    </div>
  );
};

export default DragDropQuestion;
