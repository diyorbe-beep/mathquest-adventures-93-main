import { useAuth } from '@/contexts/AuthContext';
import { useAchievements } from '@/hooks/useAchievements';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const AchievementsPage = () => {
  const { user } = useAuth();
  const { allAchievements, userAchievements } = useAchievements();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/auth" replace />;

  const earnedIds = new Set(userAchievements.map(a => a.achievement_id));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/dashboard')} className="rounded-xl p-2 hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">🎖️ Yutuqlar</h1>
          <span className="ml-auto text-sm font-bold text-muted-foreground">{userAchievements.length}/{allAchievements.length}</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="grid grid-cols-2 gap-3">
          {allAchievements.map((achievement, i) => {
            const earned = earnedIds.has(achievement.id);
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`rounded-2xl p-5 text-center transition-all ${
                  earned ? 'bg-quest-yellow/10 shadow-md' : 'bg-muted opacity-60'
                }`}
              >
                <span className={`text-4xl block mb-2 ${earned ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </span>
                <p className="font-extrabold text-sm text-foreground">{achievement.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                {earned && (
                  <span className="mt-2 inline-block rounded-full bg-quest-green/20 px-2 py-0.5 text-xs font-bold text-quest-green">
                    ✓ Qozonildi
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AchievementsPage;
