import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRoles } from '@/hooks/useRoles';
import { supabase } from '@/integrations/supabase/client';
import AdminPage from '@/pages/AdminPage';

/**
 * `/admin` — Supabase Auth (email + parol) + `user_roles` da `admin` roli.
 * Lovable: service_role kerak emas; rol `supabase/manual/grant-admin.sql` orqali beriladi.
 */
const AdminAccess = () => {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { isAdmin, isLoading: rolesLoading } = useRoles();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading || (user && rolesLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-2xl font-bold animate-pulse text-primary">Yuklanmoqda...</div>
      </div>
    );
  }

  if (user && isAdmin) {
    return <AdminPage />;
  }

  if (user && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center rounded-2xl bg-card p-8 shadow-lg max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-black text-foreground mb-2">Administrator emas</h2>
          <p className="text-muted-foreground font-semibold mb-4">
            Bu hisobda <strong>admin</strong> roli yo‘q. Avval Supabase’da rol qo‘shing (loyiha ildizidagi{' '}
            <code className="text-xs">supabase/manual/grant-admin.sql</code>) yoki boshqa hisob bilan kiring.
          </p>
          <button
            type="button"
            onClick={() => signOut()}
            className="mb-3 w-full rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground"
          >
            Chiqish
          </button>
          <Link to="/dashboard" className="text-sm font-semibold text-primary underline-offset-2 hover:underline">
            Boshqaruv paneliga
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const trimmedEmail = email.trim();
      const { error } = await signIn(trimmedEmail, password);
      if (error) throw error;

      const { data: sessionData } = await supabase.auth.getUser();
      const uid = sessionData.user?.id;
      if (!uid) throw new Error('Sessiya topilmadi');

      const { data: roleRows, error: roleErr } = await supabase.from('user_roles' as never).select('role').eq('user_id', uid);
      if (roleErr) throw roleErr;

      const hasAdmin = (roleRows as { role: string }[] | null)?.some((r) => r.role === 'admin');
      if (!hasAdmin) {
        await supabase.auth.signOut();
        toast.error('Bu hisobda administrator roli yo‘q. LOVABLE_ADMIN.txt va grant-admin.sql ni o‘qing.');
        return;
      }

      toast.success('Xush kelibsiz, administrator');
    } catch (err: unknown) {
      const raw =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : err instanceof Error
            ? err.message
            : 'Kirish muvaffaqiyatsiz';
      const lower = raw.toLowerCase();
      let extra = '';
      if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
        extra = ' Email yoki parol noto‘g‘ri, yoki hisob yo‘q (/auth dan ro‘yxatdan o‘ting).';
      }
      if (lower.includes('email not confirmed')) {
        extra = ' Supabase’da email tasdiqlang yoki Authentication sozlamalarida tasdiqlashni o‘chiring.';
      }
      toast.error(raw + extra);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg shadow-primary/5"
      >
        <div className="mb-6 text-center">
          <div className="text-5xl mb-3">⚙️</div>
          <h1 className="text-2xl font-black text-foreground">Administrator kirishi</h1>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Ro‘yxatdan o‘tgan emailingiz va parolingiz (Supabase Auth). Admin roli alohida beriladi.
          </p>
        </div>

        <div className="mb-4 rounded-xl bg-muted/60 p-3 text-left text-xs font-semibold text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Lovable:</strong> avval <code className="rounded bg-muted px-1">/auth</code> da
          hisob oching, keyin loyiha faylida <code className="rounded bg-muted px-1">LOVABLE_ADMIN.txt</code> va{' '}
          <code className="rounded bg-muted px-1">supabase/manual/grant-admin.sql</code> bo‘yicha SQL da o‘z UUID ingizga{' '}
          <code className="rounded bg-muted px-1">admin</code> rol qo‘shing. <code className="rounded bg-muted px-1">service_role</code>{' '}
          kaliti kerak emas.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="siz@email.com"
              required
              autoComplete="username"
              className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="current-password"
              className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl active:scale-[0.97] disabled:opacity-60"
          >
            {submitting ? 'Kutilmoqda...' : 'Kirish'}
          </button>
        </form>

        <p className="mt-6 space-y-2 text-center text-xs font-semibold text-muted-foreground">
          <span className="block">
            <Link to="/auth" className="text-primary underline-offset-2 hover:underline">
              Oddiy foydalanuvchi kirishi
            </Link>
          </span>
          <span className="block">
            <Link to="/" className="underline-offset-2 hover:underline">
              Bosh sahifa
            </Link>
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminAccess;
