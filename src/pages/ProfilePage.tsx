import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import AVATARS, { getAvatarEmoji } from '@/lib/avatars';
import { getProfileDisplayName } from '@/lib/displayName';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import HeartCountdownHint from '@/components/HeartCountdownHint';

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_id ?? 1);

  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) return null;

  const handleSaveAvatar = async () => {
    try {
      await updateProfile.mutateAsync({ avatar_id: selectedAvatar });
      toast.success('Avatar yangilandi! 🎉');
    } catch {
      toast.error('Avatarni yangilab bo‘lmadi');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/dashboard')} className="rounded-xl p-2 hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">👤 Mening profilim</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Current avatar */}
          <div className="text-center mb-8">
            <motion.div 
              className="text-8xl mb-3 inline-block"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {getAvatarEmoji(selectedAvatar)}
            </motion.div>
            <h2 className="text-2xl font-black text-foreground">
              {getProfileDisplayName(profile, user)}
            </h2>
            <p className="text-muted-foreground font-semibold">{profile.level}-daraja · {profile.xp} XP</p>
          </div>

          {/* Avatar selector */}
          <div className="rounded-2xl bg-card p-6 shadow-md mb-6">
            <h3 className="font-extrabold text-foreground mb-4">Avatarni tanlang</h3>
            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map(avatar => (
                <motion.button
                  key={avatar.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-all ${
                    selectedAvatar === avatar.id
                      ? 'bg-primary/10 border-2 border-primary shadow-md'
                      : 'bg-muted border-2 border-transparent hover:border-border'
                  }`}
                >
                  {avatar.emoji}
                </motion.button>
              ))}
            </div>
            {selectedAvatar !== profile.avatar_id && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleSaveAvatar}
                className="mt-4 w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-[0.97]"
              >
                Avatarni saqlash ✨
              </motion.button>
            )}
          </div>

          {/* Stats */}
          <div className="rounded-2xl bg-card p-6 shadow-md">
            <h3 className="font-extrabold text-foreground mb-4">Statistika</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold">🔥 Ketma-ketlik</span>
                <span className="font-bold text-foreground">{profile.streak_days} kun</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground font-semibold">❤️ Yurakchalar</span>
                <div className="flex flex-col items-end gap-0.5 text-right">
                  <span className="font-bold text-foreground">{profile.hearts}/5</span>
                  <HeartCountdownHint
                    hearts={profile.hearts}
                    heartsLastRegen={profile.hearts_last_regen}
                    className="text-[11px] text-muted-foreground"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold">⭐ Jami XP</span>
                <span className="font-bold text-foreground">{profile.xp.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold">🎯 Daraja</span>
                <span className="font-bold text-foreground">{profile.level}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
