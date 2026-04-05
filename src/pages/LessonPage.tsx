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
import EquationBuilderQuestion from '@/components/EquationBuilderQuestion';
import TypeAnswerQuestion from '@/components/TypeAnswerQuestion';
import NumberLineQuestion from '@/components/NumberLineQuestion';
import { toUzbekExplanation, toUzbekOption, toUzbekQuestionText } from '@/lib/questionI18n';
import { toUzbekLessonTitle } from '@/lib/lessonI18n';
import { isDragDropSelectMode } from '@/lib/dragDropSelectMode';
import { useLogQuestionAttempt } from '@/hooks/useLearningEngine';

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const { profile, addXp, loseHeart, regenerateHearts } = useProfile();
  const { data: questions, isLoading } = useQuestions(lessonId);
  const logAttempt = useLogQuestionAttempt();
  const saveProgress = useSaveProgress();
  const checkAchievements = useCheckAchievements();
  const { data: allProgress } = useUserProgress();
  const navigate = useNavigate();

  const [sessionQuestions, setSessionQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [finished, setFinished] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [topicId, setTopicId] = useState<string | null>(null);
  const [xpReward, setXpReward] = useState(10);
  const startTimeRef = useRef(Date.now());
  const questionStartedAtRef = useRef(Date.now());

  // Check if user has hearts to answer questions
  const hasHearts = (profile?.hearts ?? 0) > 0;

  useEffect(() => {
    if (lessonId) {
      supabase.from('lessons').select('title, xp_reward, topic_id').eq('id', lessonId).single().then(({ data }) => {
        if (data) {
          setLessonTitle(data.title);
          setXpReward(data.xp_reward);
          setTopicId(data.topic_id);
        }
      });
    }
  }, [lessonId]);

  useEffect(() => {
    if (questions?.length) {
      setSessionQuestions([...questions]);
      setCurrentIndex(0);
      questionStartedAtRef.current = Date.now();
    }
  }, [questions]);

  useEffect(() => {
    if (profile) regenerateHearts.mutate();
  }, [profile?.user_id]);

  if (!user) return <Navigate to="/auth" replace />;
  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-xl font-bold animate-pulse text-primary">Savollar yuklanmoqda...</div>;
  if (!sessionQuestions?.length) return <div className="flex min-h-screen items-center justify-center text-xl font-bold text-muted-foreground">Savollar topilmadi</div>;

  const currentQuestion = sessionQuestions[currentIndex];
  const progressPercent = ((currentIndex) / sessionQuestions.length) * 100;
  const options: string[] = Array.isArray(currentQuestion?.options) ? currentQuestion.options as string[] : [];
  const isDragDrop = currentQuestion.question_type === 'drag_drop';
  const isEquationBuilder = currentQuestion.question_type === 'equation_builder';
  const isTypeAnswer = currentQuestion.question_type === 'type_answer';
  const isNumberLine = currentQuestion.question_type === 'number_line';

  const normalizeAnswer = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .split(',')
      .map((x) => x.trim())
      .join(',');

  const normalizeTokens = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

  const hasCommutativeOperator = (questionText: string, expectedTokens: string[]) => {
    const expected = expectedTokens.join(' ');
    return /(\+|×|\*|\bx\b)/i.test(questionText) || /(\+|×|\*|\bx\b)/i.test(expected);
  };

  const hasNonCommutativeOperator = (questionText: string, expectedTokens: string[]) => {
    const expected = expectedTokens.join(' ');
    return /(-|÷|\/)/i.test(questionText) || /(-|÷|\/)/i.test(expected);
  };

  const isCommutativeEquationMatch = (answer: string, correctAnswer: string, questionText: string) => {
    const actualTokens = normalizeTokens(answer);
    const expectedTokens = normalizeTokens(correctAnswer);
    if (actualTokens.length !== expectedTokens.length) return false;

    // If question has only +/* style operator, accept same tokens in any order.
    const commutative = hasCommutativeOperator(questionText, expectedTokens);
    const nonCommutative = hasNonCommutativeOperator(questionText, expectedTokens);
    if (!commutative || nonCommutative) {
      return actualTokens.join(',') === expectedTokens.join(',');
    }

    const counts = new Map<string, number>();
    for (const token of expectedTokens) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
    for (const token of actualTokens) {
      const left = counts.get(token);
      if (!left) return false;
      if (left === 1) counts.delete(token);
      else counts.set(token, left - 1);
    }
    return counts.size === 0;
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    
    // Check if user has hearts before allowing answer
    if (!hasHearts) {
      setShowResult(true);
      setIsCorrect(false);
      return;
    }
    
    setSelectedAnswer(answer);
    const dragDropSelect =
      isDragDrop && isDragDropSelectMode(currentQuestion.question_text, currentQuestion.correct_answer, options.length);
    const correct_ =
      isEquationBuilder || dragDropSelect
        ? isCommutativeEquationMatch(answer, currentQuestion.correct_answer, currentQuestion.question_text)
        : normalizeAnswer(answer) === normalizeAnswer(currentQuestion.correct_answer);
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - questionStartedAtRef.current) / 1000));
    setIsCorrect(correct_);
    setShowResult(true);
    setTotal(prev => prev + 1);

    if (correct_) {
      setCorrect(prev => prev + 1);
    } else {
      loseHeart.mutate();
    }

    if (lessonId) {
      logAttempt.mutate({
        lessonId,
        questionId: currentQuestion.id,
        topicId,
        selectedAnswer: answer,
        correctAnswer: currentQuestion.correct_answer,
        isCorrect: correct_,
        difficulty: currentQuestion.difficulty ?? 1,
        questionType: currentQuestion.question_type ?? 'multiple_choice',
        timeSpentSeconds,
      });
    }
  };

  const handleContinue = async () => {
    if (currentIndex < sessionQuestions.length - 1) {
      // Adaptive ordering: after correct, move a harder question earlier; after wrong, easier one earlier.
      setSessionQuestions((prev) => {
        const nextPos = currentIndex + 1;
        if (nextPos >= prev.length) return prev;
        const target = isCorrect
          ? Math.min(3, Number(currentQuestion.difficulty ?? 1) + 1)
          : Math.max(1, Number(currentQuestion.difficulty ?? 1) - 1);
        const candidate = prev.findIndex((q, idx) => idx > currentIndex && Number(q.difficulty ?? 1) === target);
        if (candidate === -1 || candidate === nextPos) return prev;
        const clone = [...prev];
        const tmp = clone[nextPos];
        clone[nextPos] = clone[candidate];
        clone[candidate] = tmp;
        return clone;
      });

      setCurrentIndex(prev => prev + 1);
      questionStartedAtRef.current = Date.now();
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setFinished(true);
      // Calculate XP with difficulty bonus: easy=1x, medium=1.5x, hard=2x
      const avgDifficulty = sessionQuestions.reduce((s, q) => s + q.difficulty, 0) / sessionQuestions.length;
      const difficultyMultiplier = avgDifficulty <= 1 ? 1 : avgDifficulty <= 2 ? 1.5 : 2;
      const earnedXp = Math.round((correct / sessionQuestions.length) * xpReward * difficultyMultiplier);
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
      const perfectCount = (allProgress?.filter(p => Number(p.best_accuracy) === 100).length ?? 0) + (correct === sessionQuestions.length ? 1 : 0);

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
    const avgDifficulty = sessionQuestions.reduce((s, q) => s + q.difficulty, 0) / sessionQuestions.length;
    const difficultyMultiplier = avgDifficulty <= 1 ? 1 : avgDifficulty <= 2 ? 1.5 : 2;
    const earnedXp = Math.round((correct / sessionQuestions.length) * xpReward * difficultyMultiplier);
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
          <p className="text-muted-foreground font-semibold mb-6">{toUzbekLessonTitle(lessonTitle)}</p>

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
                {currentIndex + 1}/{sessionQuestions.length}-savol
                {isDragDrop && <span className="ml-2 text-quest-purple">🧩 Surib qo‘yish</span>}
                {isEquationBuilder && <span className="ml-2 text-quest-blue">🧱 Tenglama tuzish</span>}
                {isTypeAnswer && <span className="ml-2 text-quest-orange">⌨️ Javob yozish</span>}
                {isNumberLine && <span className="ml-2 text-quest-green">📏 Son o‘qi</span>}
              </p>
              <h2 className="text-2xl font-black text-foreground mb-8 text-balance" style={{ lineHeight: '1.2' }}>
                {toUzbekQuestionText(currentQuestion.question_text)}
              </h2>

              {!hasHearts && (
                <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border-2 border-destructive/20">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💔</span>
                    <div>
                      <p className="font-bold text-destructive">Yuraklar tugadi!</p>
                      <p className="text-sm text-muted-foreground">
                        Yuraklar tiklanishini kutish yoki do‘kondan sotib oling.
                      </p>
                      <HeartCountdownHint
                        hearts={profile?.hearts ?? 0}
                        heartsLastRegen={profile?.hearts_last_regen ?? ''}
                        className="text-sm font-semibold text-destructive"
                      />
                    </div>
                  </div>
                </div>
              )}

              {isDragDrop ? (
                <DragDropQuestion
                  options={options}
                  correctAnswer={currentQuestion.correct_answer}
                  questionText={currentQuestion.question_text}
                  onAnswer={handleAnswer}
                  disabled={showResult || !hasHearts}
                />
              ) : isEquationBuilder ? (
                <EquationBuilderQuestion
                  options={options}
                  correctAnswer={currentQuestion.correct_answer}
                  onAnswer={handleAnswer}
                  disabled={showResult || !hasHearts}
                />
              ) : isTypeAnswer ? (
                <TypeAnswerQuestion
                  onAnswer={handleAnswer}
                  disabled={showResult || !hasHearts}
                />
              ) : isNumberLine ? (
                <NumberLineQuestion
                  options={options}
                  onAnswer={handleAnswer}
                  disabled={showResult || !hasHearts}
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
                        whileHover={!showResult && hasHearts ? { scale: 1.01 } : {}}
                        whileTap={!showResult && hasHearts ? { scale: 0.98 } : {}}
                        onClick={() => handleAnswer(option)}
                        disabled={showResult || !hasHearts}
                        className={`w-full rounded-2xl border-2 px-5 py-4 text-left font-bold text-foreground transition-all ${borderClass} ${
                          showResult && option === selectedAnswer && option !== currentQuestion.correct_answer ? 'animate-shake' : ''
                        }`}
                      >
                        <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-black text-muted-foreground">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {toUzbekOption(option)}
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
                  {!hasHearts ? '💔 Yuraklar tugadi!' : isCorrect ? '🎉 To‘g‘ri!' : '❌ Noto‘g‘ri'}
                </p>
                {!hasHearts && (
                  <p className="mt-1 text-sm text-muted-foreground font-semibold">
                    Yuraklar tiklanishini kutish yoki do‘kondan sotib oling.
                  </p>
                )}
                {!isCorrect && hasHearts && currentQuestion.explanation && (
                  <div className="mt-1">
                    {toUzbekExplanation(currentQuestion.explanation)
                      .split(/[.;]\s+/)
                      .filter(Boolean)
                      .slice(0, 3)
                      .map((step, i) => (
                        <p key={i} className="text-sm text-muted-foreground font-semibold">
                          {i + 1}) {step}
                        </p>
                      ))}
                  </div>
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
