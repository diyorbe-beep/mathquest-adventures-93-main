import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuestions, useSaveProgress } from '@/hooks/useLessons';
import { useProfile } from '@/hooks/useProfile';
import { useCheckAchievements } from '@/hooks/useAchievements';
import { useUserProgress } from '@/hooks/useLessons';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';
import DragDropQuestion from '@/components/DragDropQuestion';
import HeartCountdownHint from '@/components/HeartCountdownHint';

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const { profile, addXp, loseHeart, regenerateHearts } = useProfile();
  const { data: questions, isLoading } = useQuestions(lessonId);
  const saveProgress = useSaveProgress();
  const checkAchievements = useCheckAchievements();
  const { data: allProgress } = useUserProgress();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [finished, setFinished] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [xpReward, setXpReward] = useState(10);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (lessonId) {
      supabase.from('lessons').select('title, xp_reward').eq('id', lessonId).single().then(({ data }) => {
        if (data) {
          setLessonTitle(data.title);
          setXpReward(data.xp_reward);
        }
      });
    }
  }, [lessonId]);

  useEffect(() => {
    if (profile) regenerateHearts.mutate();
  }, [profile?.user_id]);

  if (!user) return <Navigate to="/auth" replace />;
  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-xl font-bold animate-pulse text-primary">Savollar yuklanmoqda...</div>;
  if (!questions?.length) return <div className="flex min-h-screen items-center justify-center text-xl font-bold text-muted-foreground">Savollar topilmadi</div>;

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;
  const options: string[] = Array.isArray(currentQuestion?.options) ? currentQuestion.options as string[] : [];
  const isDragDrop = currentQuestion.question_type === 'drag_drop';

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    const correct_ = answer === currentQuestion.correct_answer;
    setIsCorrect(correct_);
    setShowResult(true);
    setTotal(prev => prev + 1);

    if (correct_) {
      setCorrect(prev => prev + 1);
    } else {
      loseHeart.mutate();
    }
  };

  const handleContinue = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setFinished(true);
      // Calculate XP with difficulty bonus: easy=1x, medium=1.5x, hard=2x
      const avgDifficulty = questions.reduce((s, q) => s + q.difficulty, 0) / questions.length;
      const difficultyMultiplier = avgDifficulty <= 1 ? 1 : avgDifficulty <= 2 ? 1.5 : 2;
      const earnedXp = Math.round((correct / questions.length) * xpReward * difficultyMultiplier);
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

      await saveProgress.mutateAsync({
        lessonId: lessonId!,
        correct,
        total,
        completed: true,
        xpEarned: earnedXp,
        timeSpentSeconds: timeSpent,
      });

      if (earnedXp > 0) {
        await addXp.mutateAsync({ amount: earnedXp, source: 'dars', lessonId });
      }

      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

      const completedCount = (allProgress?.filter(p => p.completed).length ?? 0) + 1;
      const perfectCount = (allProgress?.filter(p => Number(p.best_accuracy) === 100).length ?? 0) + (correct === questions.length ? 1 : 0);

      await checkAchievements.mutateAsync({
        totalXp: (profile?.xp ?? 0) + earnedXp,
        lessonsCompleted: completedCount,
        streakDays: profile?.streak_days ?? 0,
        perfectLessons: perfectCount,
      });
    }
  };

  if (finished) {
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avgDifficulty = questions.reduce((s, q) => s + q.difficulty, 0) / questions.length;
    const difficultyMultiplier = avgDifficulty <= 1 ? 1 : avgDifficulty <= 2 ? 1.5 : 2;
    const earnedXp = Math.round((correct / questions.length) * xpReward * difficultyMultiplier);
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const mins = Math.floor(timeSpent / 60);
    const secs = timeSpent % 60;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-xl"
        >
          <motion.div className="text-7xl mb-4" animate={{ y: [0, -12, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            {accuracy === 100 ? '🏆' : accuracy >= 70 ? '⭐' : '💪'}
          </motion.div>
          <h2 className="text-2xl font-black text-foreground mb-2" style={{ lineHeight: '1.1' }}>
            {accuracy === 100 ? 'Mukammal natija!' : accuracy >= 70 ? 'Ajoyib ish!' : 'Mashq qilishda davom eting!'}
          </h2>
          <p className="text-muted-foreground font-semibold mb-6">{lessonTitle}</p>

          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl bg-quest-green/10 p-3">
              <p className="text-2xl font-black text-quest-green">{correct}</p>
              <p className="text-xs font-semibold text-muted-foreground">To‘g‘ri</p>
            </div>
            <div className="rounded-xl bg-quest-blue/10 p-3">
              <p className="text-2xl font-black text-quest-blue">{accuracy}%</p>
              <p className="text-xs font-semibold text-muted-foreground">Aniqlik</p>
            </div>
            <div className="rounded-xl bg-quest-yellow/10 p-3">
              <p className="text-2xl font-black text-quest-yellow">+{earnedXp}</p>
              <p className="text-xs font-semibold text-muted-foreground">XP</p>
            </div>
            <div className="rounded-xl bg-quest-orange/10 p-3">
              <p className="text-2xl font-black text-quest-orange">{mins}:{secs.toString().padStart(2, '0')}</p>
              <p className="text-xs font-semibold text-muted-foreground">Vaqt</p>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl active:scale-[0.97]"
          >
            Davom etish 🚀
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="container mx-auto max-w-lg flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-xl p-2 hover:bg-muted transition-colors active:scale-95">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-1.5">
            <div className="flex items-center gap-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${i < (profile?.hearts ?? 0) ? '' : 'opacity-25'}`}
                >
                  ❤️
                </span>
              ))}
            </div>
            {profile && (
              <HeartCountdownHint
                hearts={profile.hearts}
                heartsLastRegen={profile.hearts_last_regen}
                className="max-w-[5.5rem] truncate text-[10px] leading-tight sm:max-w-none sm:text-xs"
              />
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                {currentIndex + 1}/{questions.length}-savol
                {isDragDrop && <span className="ml-2 text-quest-purple">🧩 Surib qo‘yish</span>}
              </p>
              <h2 className="text-2xl font-black text-foreground mb-8 text-balance" style={{ lineHeight: '1.2' }}>
                {currentQuestion.question_text}
              </h2>

              {isDragDrop ? (
                <DragDropQuestion
                  options={options}
                  correctAnswer={currentQuestion.correct_answer}
                  questionText={currentQuestion.question_text}
                  onAnswer={handleAnswer}
                  disabled={showResult}
                />
              ) : (
                <div className="space-y-3">
                  {options.map((option, i) => {
                    let borderClass = 'border-border hover:border-primary/40';
                    if (showResult) {
                      if (option === currentQuestion.correct_answer) borderClass = 'border-primary bg-primary/10';
                      else if (option === selectedAnswer) borderClass = 'border-destructive bg-destructive/10';
                      else borderClass = 'border-border opacity-50';
                    } else if (selectedAnswer === option) {
                      borderClass = 'border-primary bg-primary/5';
                    }

                    return (
                      <motion.button
                        key={option}
                        whileHover={!showResult ? { scale: 1.01 } : {}}
                        whileTap={!showResult ? { scale: 0.98 } : {}}
                        onClick={() => handleAnswer(option)}
                        disabled={showResult}
                        className={`w-full rounded-2xl border-2 px-5 py-4 text-left font-bold text-foreground transition-all ${borderClass} ${
                          showResult && option === selectedAnswer && option !== currentQuestion.correct_answer ? 'animate-shake' : ''
                        }`}
                      >
                        <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-black text-muted-foreground">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {option}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={`border-t-2 px-4 py-5 ${isCorrect ? 'border-primary bg-primary/5' : 'border-destructive bg-destructive/5'}`}
          >
            <div className="container mx-auto max-w-lg flex items-center justify-between">
              <div>
                <p className={`font-extrabold text-lg ${isCorrect ? 'text-primary' : 'text-destructive'}`}>
                  {isCorrect ? '🎉 To‘g‘ri!' : '❌ Noto‘g‘ri'}
                </p>
                {!isCorrect && currentQuestion.explanation && (
                  <p className="text-sm text-muted-foreground font-semibold mt-1">{currentQuestion.explanation}</p>
                )}
              </div>
              <button
                onClick={handleContinue}
                className={`rounded-xl px-6 py-3 font-bold text-primary-foreground shadow-lg transition-all active:scale-[0.97] ${
                  isCorrect ? 'bg-primary' : 'bg-destructive'
                }`}
              >
                Davom etish
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonPage;
