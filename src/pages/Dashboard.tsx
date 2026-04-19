import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserProgress } from '@/hooks/useLessons';
import { useLessons, useTopics } from '@/hooks/useLessons';
import { useRoles } from '@/hooks/useRoles';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useReviewDueCount } from '@/hooks/useLearningEngine';
import { getAvatarEmoji } from '@/lib/avatars';
import { getProfileDisplayName } from '@/lib/displayName';
import { toUzbekTopicName } from '@/lib/topicI18n';
import HeartCountdownHint from '@/components/HeartCountdownHint';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, regenerateHearts, updateStreak } = useProfile();
  const { data: progress } = useUserProgress();
  const { data: topics } = useTopics();
  const { data: allLessons } = useLessons();
  const { isAdmin } = useRoles();
  const { data: reviewDue = 0 } = useReviewDueCount();
  const logActivity = useActivityLog();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      regenerateHearts.mutate();
      updateStreak.mutate();
      logActivity.mutate({ action: 'dashboard_visit' });
    }
  }, [profile?.user_id]);

  if (authLoading || profileLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-2xl font-bold animate-pulse text-primary">Yuklanmoqda...</div>
    </div>
  );

  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) return null;

  const completedLessons = progress?.filter(p => p.completed).length ?? 0;
  const totalLessons = allLessons?.length ?? 0;
  const xpToNextLevel = 100 - (profile.xp % 100);

  const stagger = {
    container: { transition: { staggerChildren: 0.08 } },
    item: { 
      initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
      animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getAvatarEmoji(profile.avatar_id)}</span>
            <div>
              <h2 className="font-extrabold text-foreground leading-tight">
                {getProfileDisplayName(profile, user)}
              </h2>
              <p className="text-xs font-semibold text-muted-foreground">{profile.level}-daraja</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-full bg-quest-yellow/10 px-3 py-1">
              <span>🪙</span>
              <span className="font-bold text-sm text-foreground">{((profile as any).coins ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1" title="Yurakchalar">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-lg ${i < profile.hearts ? 'animate-pulse-heart' : 'opacity-25'}`}>
                    ❤️
                  </span>
                ))}
              </div>
              <HeartCountdownHint
                hearts={profile.hearts}
                heartsLastRegen={profile.hearts_last_regen}
                className="text-[10px] sm:text-xs"
              />
            </div>
            <div className="flex items-center gap-1 rounded-full bg-quest-orange/10 px-3 py-1">
              <span>🔥</span>
              <span className="font-bold text-sm text-foreground">{profile.streak_days}</span>
            </div>
            <button onClick={() => signOut()} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Chiqish
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div variants={stagger.container} initial="initial" animate="animate">
          {/* Stats Cards */}
          <motion.div variants={stagger.item} className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
            <StatCard icon="⭐" label="Jami tajriba balli" value={profile.xp.toLocaleString()} color="bg-quest-yellow/10 text-quest-yellow" />
            <StatCard icon="📚" label="Bajarilgan darslar" value={`${completedLessons}/${totalLessons}`} color="bg-quest-blue/10 text-quest-blue" />
            <StatCard icon="🎯" label="Daraja" value={profile.level.toString()} color="bg-quest-green/10 text-quest-green" />
            <StatCard icon="🔥" label="Ketma-ketlik" value={`${profile.streak_days} kun`} color="bg-quest-orange/10 text-quest-orange" />
          </motion.div>

          {/* XP Progress Bar */}
          <motion.div variants={stagger.item} className="mb-8 rounded-2xl bg-card p-5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-foreground">{profile.level}-daraja</span>
              <span className="text-xs font-semibold text-muted-foreground">Keyingi darajagacha {xpToNextLevel} ball</span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-quest-blue"
                initial={{ width: 0 }}
                animate={{ width: `${(profile.xp % 100)}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.div>

          {/* Navigation Grid */}
          <motion.div variants={stagger.item} className="grid grid-cols-2 gap-4 mb-8">
            <NavCard icon="🗺️" title="Sarguzasht xaritasi" subtitle="Sarguzashtni davom eting" onClick={() => { navigate('/map'); }} bgClass="bg-gradient-to-br from-quest-green/10 to-quest-blue/10" />
            <NavCard icon="🏆" title="Reyting" subtitle="Eng yaxshilarni ko‘ring" onClick={() => { navigate('/leaderboard'); }} bgClass="bg-gradient-to-br from-quest-orange/10 to-quest-yellow/10" />
            <NavCard icon="🎖️" title="Yutuqlar" subtitle={`${progress?.filter(p => p.completed).length ?? 0} ta olingan`} onClick={() => { navigate('/achievements'); }} bgClass="bg-gradient-to-br from-quest-purple/10 to-quest-pink/10" />
            <NavCard icon="👤" title="Mening profilim" subtitle="Avatarni sozlash" onClick={() => { navigate('/profile'); }} bgClass="bg-gradient-to-br from-quest-pink/10 to-quest-red/10" />
            <NavCard icon="🛍️" title="Magazin" subtitle="Coinlarga xarid qiling" onClick={() => { navigate('/shop'); }} bgClass="bg-gradient-to-br from-quest-yellow/10 to-quest-orange/10" />
            <NavCard icon="🔁" title="Takrorlash" subtitle={reviewDue > 0 ? `${reviewDue} ta savol kutmoqda` : 'Bugun navbat yo‘q'} onClick={() => { navigate('/review'); }} bgClass="bg-gradient-to-br from-quest-green/10 to-quest-teal/10" />
            <NavCard icon="🧪" title="Diagnostika" subtitle="Boshlang‘ich darajani aniqlash" onClick={() => { navigate('/diagnostic'); }} bgClass="bg-gradient-to-br from-quest-purple/10 to-quest-blue/10" />
            <NavCard icon="📊" title="O‘qish statistikasi" subtitle="Taraqqiyotni kuzating" onClick={() => { navigate('/parent-stats'); }} bgClass="bg-gradient-to-br from-quest-blue/10 to-quest-green/10" />
            {isAdmin && (
              <NavCard icon="⚙️" title="Administrator paneli" subtitle="/admin" onClick={() => { navigate('/admin'); }} bgClass="bg-gradient-to-br from-quest-red/10 to-quest-purple/10" />
            )}
          </motion.div>

          {/* Topics */}
          <motion.div variants={stagger.item}>
            <h3 className="text-xl font-extrabold text-foreground mb-4">Mavzular</h3>
            <div className="grid grid-cols-2 gap-4">
              {topics?.map(topic => {
                const topicLessons = allLessons?.filter(l => l.topic_id === topic.id) ?? [];
                const completed = progress?.filter(p => p.completed && topicLessons.some(l => l.id === p.lesson_id)).length ?? 0;
                return (
                  <motion.button
                    key={topic.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { navigate(`/topic/${topic.slug}`); }}
                    className="rounded-2xl bg-card p-5 shadow-md text-left transition-shadow hover:shadow-lg border-2 border-transparent hover:border-primary/20"
                  >
                    <span className="text-4xl block mb-2">{topic.icon}</span>
                    <h4 className="font-extrabold text-foreground">{toUzbekTopicName(topic.name)}</h4>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">{completed}/{topicLessons.length} dars</p>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: topicLessons.length ? `${(completed / topicLessons.length) * 100}%` : '0%' }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) => (
  <div className={`rounded-2xl p-4 ${color}`}>
    <span className="text-2xl">{icon}</span>
    <p className="mt-1 text-xs font-semibold opacity-70">{label}</p>
    <p className="text-lg font-extrabold">{value}</p>
  </div>
);

const NavCard = ({ icon, title, subtitle, onClick, bgClass }: { icon: string; title: string; subtitle: string; onClick: () => void; bgClass: string }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`rounded-2xl p-5 text-left ${bgClass} transition-shadow hover:shadow-md`}
  >
    <span className="text-3xl block mb-2">{icon}</span>
    <h4 className="font-extrabold text-foreground">{title}</h4>
    <p className="text-xs text-muted-foreground font-semibold">{subtitle}</p>
  </motion.button>
);

export default Dashboard;
