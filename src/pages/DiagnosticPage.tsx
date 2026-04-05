import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSavePlacementResult } from '@/hooks/useLearningEngine';
import { toUzbekOption, toUzbekQuestionText } from '@/lib/questionI18n';

const normalize = (v: string) => v.trim().toLowerCase();

const DiagnosticPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const savePlacement = useSavePlacementResult();
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [results, setResults] = useState<{ topicId: string | null; isCorrect: boolean }[]>([]);
  const [done, setDone] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['diagnostic_questions'],
    queryFn: async () => {
      const { data: rows, error } = await (supabase as any)
        .from('questions')
        .select('id, lesson_id, question_text, question_type, options, correct_answer, lessons(topic_id)')
        .order('created_at', { ascending: true })
        .limit(30);
      if (error) throw error;
      const grouped = new Map<string, any[]>();
      for (const row of rows ?? []) {
        const topicId = row.lessons?.topic_id ?? 'unknown';
        const arr = grouped.get(topicId) ?? [];
        arr.push(row);
        grouped.set(topicId, arr);
      }
      const picked: any[] = [];
      for (const arr of grouped.values()) picked.push(...arr.slice(0, 3));
      return picked.slice(0, 12);
    },
  });

  const questions = useMemo(() => data ?? [], [data]);
  const q = questions[idx];

  if (!user) return <Navigate to="/auth" replace />;
  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-xl font-bold text-primary">Diagnostika yuklanmoqda...</div>;
  if (!questions.length) return <div className="flex min-h-screen items-center justify-center text-xl font-bold text-muted-foreground">Diagnostika uchun savollar topilmadi</div>;

  const finish = async () => {
    const total = questions.length;
    const byTopic = new Map<string, { correct: number; total: number }>();
    results.forEach((r) => {
      const topicId = r.topicId;
      if (!topicId) return;
      const agg = byTopic.get(topicId) ?? { correct: 0, total: 0 };
      agg.total += 1;
      if (r.isCorrect) agg.correct += 1;
      byTopic.set(topicId, agg);
    });

    questions.forEach((row: any) => {
      const topicId = row.lessons?.topic_id ?? null;
      if (!topicId) return;
      if (!byTopic.has(topicId)) byTopic.set(topicId, { correct: 0, total: 0 });
    });

    await Promise.all(
      Array.from(byTopic.entries()).map(([topicId, agg]) =>
        savePlacement.mutateAsync({ topicId, correct: agg.correct, total: agg.total })
      )
    );
    await savePlacement.mutateAsync({ topicId: null, correct, total });
    setDone(true);
  };

  if (done) {
    const score = Math.round((correct / questions.length) * 100);
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-6 text-center shadow-md">
          <p className="text-5xl mb-2">🧪</p>
          <h2 className="text-2xl font-black text-foreground">Diagnostika tugadi</h2>
          <p className="mt-2 text-muted-foreground font-semibold">Natija: {correct}/{questions.length} ({score}%)</p>
          <button onClick={() => { navigate('/dashboard'); }} className="mt-5 w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground">
            Dashboardga qaytish
          </button>
        </div>
      </div>
    );
  }

  const options: string[] = Array.isArray(q.options) ? (q.options as string[]) : [];
  const answer = async (value: string) => {
    const ok = normalize(value) === normalize(q.correct_answer ?? '');
    if (ok) setCorrect((c) => c + 1);
    setResults((prev) => [...prev, { topicId: q.lessons?.topic_id ?? null, isCorrect: ok }]);
    if (idx < questions.length - 1) setIdx((v) => v + 1);
    else await finish();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3 max-w-lg">
          <button onClick={() => { navigate('/dashboard'); }} className="rounded-xl p-2 hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">🧪 Diagnostika testi</h1>
          <span className="ml-auto text-xs font-bold text-muted-foreground">{idx + 1}/{questions.length}</span>
        </div>
      </header>
      <main className="container mx-auto max-w-lg px-4 py-8">
        <h2 className="text-2xl font-black text-foreground mb-6">{toUzbekQuestionText(q.question_text ?? '')}</h2>
        <div className="space-y-2">
          {options.map((opt) => (
            <button key={opt} onClick={() => answer(opt)} className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-left font-bold text-foreground hover:border-primary/40">
              {toUzbekOption(opt)}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DiagnosticPage;
