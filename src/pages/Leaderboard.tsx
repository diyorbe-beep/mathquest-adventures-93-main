import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { getAvatarEmoji } from '@/lib/avatars';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const Leaderboard = () => {
  const { user } = useAuth();
  const { data: leaderboard, isLoading } = useLeaderboard();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/auth" replace />;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/dashboard')} className="rounded-xl p-2 hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">🏆 Reyting</h1>
          <span className="ml-auto text-xs font-semibold text-muted-foreground rounded-full bg-quest-green/10 px-3 py-1">
            🟢 Jonli
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground font-bold animate-pulse">Reyting yuklanmoqda...</div>
        ) : (
          <div className="space-y-2">
            {leaderboard?.map((entry, i) => {
              const isMe = entry.user_id === user.id;
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex items-center gap-4 rounded-2xl p-4 transition-all ${
                    isMe ? 'bg-primary/10 border-2 border-primary/20' : 'bg-card shadow-sm'
                  }`}
                >
                  <span className="w-8 text-center font-black text-lg">
                    {i < 3 ? medals[i] : <span className="text-muted-foreground">{entry.rank}</span>}
                  </span>
                  <span className="text-3xl">{getAvatarEmoji(entry.avatar_id)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{entry.username}</p>
                    <p className="text-xs text-muted-foreground font-semibold">{entry.level}-daraja · 🔥 {entry.streak_days}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-foreground">{entry.xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground font-semibold">XP</p>
                  </div>
                </motion.div>
              );
            })}
            {(!leaderboard || leaderboard.length === 0) && (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">👻</p>
                <p className="font-bold text-muted-foreground">Hali hech kim yo‘q! Birinchi bo‘ling.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
