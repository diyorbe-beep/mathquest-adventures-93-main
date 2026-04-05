import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useReviewQuestions, useLogQuestionAttempt } from '@/hooks/useLearningEngine';
import { toUzbekOption, toUzbekQuestionText } from '@/lib/questionI18n';

const normalize = (v: string) => v.trim().toLowerCase();

const ReviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useReviewQuestions();
  const logAttempt = useLogQuestionAttempt();
  const [answer, setAnswer] = useState('');
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);

  if (!user) return <Navigate to="/auth" replace />;
  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-xl font-bold text-primary">Takrorlash yuklanmoqda...</div>;

  const rows = data ?? [];
  const row = rows[idx];
  const q = row?.questions;
  if (!row || !q) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto flex items-center gap-4 px-4 py-3 max-w-lg">
            <button onClick={() => { navigate('/dashboard'); }} className="rounded-xl p-2 hover:bg-muted transition-colors active:scale-95">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-extrabold text-foreground">🔁 Takrorlash</h1>
          </div>
        </header>
        <main className="container mx-auto max-w-lg px-4 py-8">
          <div className="rounded-2xl bg-card p-6 text-center shadow-md">
            <p className="text-4xl mb-2">✅</p>
            <p className="font-extrabold text-foreground">Bugun takrorlash savollari yo‘q</p>
            <p className="text-sm font-semibold text-muted-foreground mt-2">Ajoyib! Rejada ortda qolgan savol topilmadi.</p>
          </div>
        </main>
      </div>
    );
  }

  const options: string[] = Array.isArray(q.options) ? (q.options as string[]) : [];

  const submit = async (value: string) => {
    const ok = normalize(value) === normalize(q.correct_answer ?? '');
    setResult(ok);
    await logAttempt.mutateAsync({
      lessonId: q.lesson_id,
      questionId: q.id,
      selectedAnswer: value,
      correctAnswer: q.correct_answer ?? '',
      isCorrect: ok,
      difficulty: q.difficulty ?? 1,
      questionType: q.question_type ?? 'multiple_choice',
      timeSpentSeconds: 10,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3 max-w-lg">
          <button onClick={() => { navigate('/dashboard'); }} className="rounded-xl p-2 hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">🔁 Takrorlash</h1>
          <span className="ml-auto text-xs font-bold text-muted-foreground">{idx + 1}/{rows.length}</span>
        </div>
      </header>
      <main className="container mx-auto max-w-lg px-4 py-8">
        <h2 className="text-2xl font-black text-foreground mb-6">{toUzbekQuestionText(q.question_text ?? '')}</h2>
        {options.length > 0 ? (
          <div className="space-y-2">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => submit(opt)}
                disabled={result !== null || logAttempt.isPending}
                className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-left font-bold text-foreground hover:border-primary/40 disabled:opacity-60"
              >
                {toUzbekOption(opt)}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <input
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); }}
              className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 font-bold text-foreground"
              placeholder="Javobni kiriting"
              disabled={result !== null}
            />
            <button onClick={() => submit(answer)} disabled={!answer || result !== null} className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground">
              Tekshirish
            </button>
          </div>
        )}

        {result !== null && (
          <div className={`mt-4 rounded-xl p-4 ${result ? 'bg-primary/10' : 'bg-destructive/10'}`}>
            <p className={`font-black ${result ? 'text-primary' : 'text-destructive'}`}>{result ? 'To‘g‘ri' : 'Noto‘g‘ri'}</p>
            {!result && <p className="text-sm text-muted-foreground mt-1">To‘g‘ri javob: {q.correct_answer}</p>}
            <button
              onClick={async () => {
                setResult(null);
                setAnswer('');
                if (idx < rows.length - 1) setIdx((v) => v + 1);
                else await refetch();
              }}
              className="mt-3 rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground"
            >
              Davom etish
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReviewPage;
