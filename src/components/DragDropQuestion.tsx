import { useState, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';

interface DragDropQuestionProps {
  options: string[];
  correctAnswer: string; // comma-separated expected order/selection
  questionText: string;
  onAnswer: (answer: string) => void;
  disabled: boolean;
}

const DragDropQuestion = ({ options, correctAnswer, questionText, onAnswer, disabled }: DragDropQuestionProps) => {
  const [items, setItems] = useState(options);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Determine mode: if correct answer length < options length, it's a "select" mode
  // Otherwise it's an "order" mode
  const correctParts = correctAnswer.split(',');
  const q = questionText.toLowerCase();
  const looksLikeOrdering =
    q.includes('order') ||
    q.includes('arrange') ||
    q.includes('tartib') ||
    q.includes('joylashtir') ||
    q.includes('ketma-ket') ||
    q.includes('surib');
  const isSelectMode = correctParts.length < options.length && !looksLikeOrdering;
  const isOrderMode = !isSelectMode;

  const toggleSelect = (item: string) => {
    if (disabled) return;
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = () => {
    if (disabled) return;
    const answer = isSelectMode 
      ? selectedItems.join(',')
      : items.join(',');
    onAnswer(answer);
  };

  const hasSelection = isSelectMode ? selectedItems.length > 0 : true;

  return (
    <div className="space-y-4">
      {isOrderMode ? (
        <div>
          <p className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Tartiblash uchun surib qo‘ying
          </p>
          <Reorder.Group axis="y" values={items} onReorder={disabled ? () => {} : setItems} className="space-y-2">
            {items.map((item) => (
              <Reorder.Item
                key={item}
                value={item}
                className="rounded-2xl border-2 border-border bg-card px-5 py-4 font-bold text-foreground cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow select-none"
                whileDrag={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-lg">⠿</span>
                  <span>{item}</span>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      ) : (
        <div>
          <p className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Tanlash uchun bosing
          </p>
          <div className="space-y-2">
            {options.map((item) => {
              const selected = selectedItems.includes(item);
              return (
                <motion.button
                  key={item}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleSelect(item)}
                  disabled={disabled}
                  className={`w-full rounded-2xl border-2 px-5 py-4 text-left font-bold text-foreground transition-all ${
                    selected
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-black ${
                      selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {selected ? '✓' : '○'}
                    </span>
                    <span>{item}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        disabled={disabled || !hasSelection}
        className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl active:scale-[0.97] disabled:opacity-50"
      >
        Javobni tekshirish ✨
      </motion.button>
    </div>
  );
};

export default DragDropQuestion;
