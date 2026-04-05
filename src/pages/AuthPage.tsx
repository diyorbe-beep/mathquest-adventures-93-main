import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AuthPage = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-2xl font-bold animate-pulse text-primary">Yuklanmoqda...</div>
    </div>
  );

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Xush kelibsiz! 🎉');
      } else {
        if (username.length < 3) {
          toast.error('Foydalanuvchi nomi kamida 3 ta belgidan iborat bo‘lishi kerak');
          setSubmitting(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) throw error;
        toast.success('Hisob yaratildi! Tasdiqlash uchun emailingizni tekshiring. 📧');
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : 'Nimadir xato ketdi';
      const lower = msg.toLowerCase();
      if (
        lower.includes('bunday foydalanuvchi nomi allaqachon mavjud') ||
        (lower.includes('duplicate') && lower.includes('username')) ||
        lower.includes('idx_profiles_username_lower_unique')
      ) {
        toast.error('Bunday nomli user bor. Boshqa nom tanlang.');
        return;
      }
      let hint = '';
      if (lower.includes('database error') || lower.includes('saving new user') || msg.includes('500')) {
        hint =
          ' Loyiha ildizidagi SIGNUP_500_FIX.txt yoki supabase/migrations/20260324120000_fix_signup_triggers.sql ni Supabase SQL Editor da ishga tushiring.';
      }
      toast.error(msg + hint);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div 
            className="text-6xl mb-4"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            🧮
          </motion.div>
          <h1 className="text-4xl font-black text-foreground text-balance" style={{ lineHeight: '1.1' }}>
            MathQuest
          </h1>
          <p className="mt-2 text-muted-foreground font-semibold">
            Matematika sarguzashingiz shu yerda boshlanadi!
          </p>
        </div>

        <div className="rounded-2xl bg-card p-8 shadow-lg shadow-primary/5">
          <div className="mb-6 flex rounded-xl bg-muted p-1">
            <button
              onClick={() => { setIsLogin(true); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
                isLogin ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Kirish
            </button>
            <button
              onClick={() => { setIsLogin(false); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
                !isLogin ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Ro‘yxatdan o‘tish
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="mb-1.5 block text-sm font-bold text-foreground">Foydalanuvchi nomi</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); }}
                  placeholder="MatematikaQahramoni42"
                  required={!isLogin}
                  minLength={3}
                  maxLength={20}
                  className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </motion.div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-bold text-foreground">Elektron pochta</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); }}
                placeholder="siz@misol.com"
                required
                className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-foreground">Parol</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); }}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] disabled:opacity-60"
            >
              {submitting ? '⏳ Iltimos, kuting...' : isLogin ? '🚀 Kettik!' : '🎮 Hisob yaratish'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
