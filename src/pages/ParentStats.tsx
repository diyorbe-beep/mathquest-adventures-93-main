import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress } from '@/hooks/useLessons';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useSkillMastery, useReviewDueCount } from '@/hooks/useLearningEngine';
import { toUzbekTopicName } from '@/lib/topicI18n';

const xpSourceLabel: Record<string, string> = {
  dars: 'Dars',
  lesson: 'Dars',
};

const ParentStats = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { data: progress } = useUserProgress();
  const navigate = useNavigate();
  const { data: mastery } = useSkillMastery();
  const { data: reviewDue = 0 } = useReviewDueCount();

  const { data: xpLogs } = useQuery({
    queryKey: ['xp_logs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('xp_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) return null;

  const completedLessons = progress?.filter(p => p.completed) ?? [];
  const totalAnswers = progress?.reduce((s, p) => s + p.total_answers, 0) ?? 0;
  const totalCorrect = progress?.reduce((s, p) => s + p.correct_answers, 0) ?? 0;
  const totalTimeSeconds = progress?.reduce((s, p) => s + (p.time_spent_seconds ?? 0), 0) ?? 0;
  const totalMins = Math.floor(totalTimeSeconds / 60);
  const overallAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

  // XP over last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const xpByDay = last7Days.map(day => ({
    day: new Date(day).toLocaleDateString('uz-UZ', { weekday: 'short' }),
    xp: xpLogs?.filter(l => l.created_at.startsWith(day)).reduce((s, l) => s + l.amount, 0) ?? 0,
  }));

  const maxXp = Math.max(...xpByDay.map(d => d.xp), 1);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => { navigate('/dashboard'); }} className="rounded-xl p-2 hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">📊 O‘qish statistikasi</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-quest-green/10 p-4">
              <p className="text-xs font-semibold text-muted-foreground">Tugallangan darslar</p>
              <p className="text-3xl font-black text-quest-green">{completedLessons.length}</p>
            </div>
            <div className="rounded-2xl bg-quest-blue/10 p-4">
              <p className="text-xs font-semibold text-muted-foreground">Umumiy aniqlik</p>
              <p className="text-3xl font-black text-quest-blue">{overallAccuracy}%</p>
            </div>
            <div className="rounded-2xl bg-quest-yellow/10 p-4">
              <p className="text-xs font-semibold text-muted-foreground">Jami XP</p>
              <p className="text-3xl font-black text-quest-yellow">{profile.xp.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-quest-purple/10 p-4">
              <p className="text-xs font-semibold text-muted-foreground">Sarflangan vaqt</p>
              <p className="text-3xl font-black text-quest-purple">{totalMins} daq</p>
            </div>
            <div className="rounded-2xl bg-quest-orange/10 p-4">
              <p className="text-xs font-semibold text-muted-foreground">Javob berilgan savollar</p>
              <p className="text-3xl font-black text-quest-orange">{totalAnswers}</p>
            </div>
          </div>

          {/* XP Chart */}
          <div className="rounded-2xl bg-card p-6 shadow-md">
            <h3 className="font-extrabold text-foreground mb-4">Shu haftadagi XP</h3>
            <div className="flex items-end gap-2 h-32">
              {xpByDay.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-foreground">{d.xp > 0 ? d.xp : ''}</span>
                  <motion.div
                    className="w-full rounded-t-lg bg-primary/80"
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.xp / maxXp) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ minHeight: d.xp > 0 ? 8 : 2 }}
                  />
                  <span className="text-xs text-muted-foreground font-semibold">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Skills */}
          <div className="rounded-2xl bg-card p-6 shadow-md">
            <h3 className="font-extrabold text-foreground mb-4">Zaif ko‘nikmalar</h3>
            {mastery && mastery.length > 0 ? (
              <div className="space-y-2">
                {[...mastery]
                  .sort((a, b) => Number(a.mastery_score ?? 0) - Number(b.mastery_score ?? 0))
                  .slice(0, 5)
                  .map((m) => (
                    <div key={m.id} className="rounded-xl bg-background border border-border px-3 py-2">
                      <p className="font-bold text-sm text-foreground">{m.topics?.icon ?? '📘'} {toUzbekTopicName(m.topics?.name ?? 'Mavzu')}</p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        Mastery: {m.mastery_score}% · Urinish: {m.attempts} · To‘g‘ri: {m.correct_count}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground font-semibold">Hali mastery ma’lumotlari yig‘ilmagan.</p>
            )}
            <button
              onClick={() => { navigate('/review'); }}
              className="mt-4 w-full rounded-xl bg-primary py-2.5 font-bold text-primary-foreground shadow-md"
            >
              Takrorlashga o‘tish ({reviewDue})
            </button>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl bg-card p-6 shadow-md">
            <h3 className="font-extrabold text-foreground mb-4">So‘nggi faollik</h3>
            {xpLogs && xpLogs.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {xpLogs.slice(0, 10).map(log => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-bold text-sm text-foreground">+{log.amount} XP</p>
                      <p className="text-xs text-muted-foreground">{xpSourceLabel[log.source] ?? log.source}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm font-semibold">Hali faollik yo‘q. O‘rganishni boshlang! 🚀</p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ParentStats;
