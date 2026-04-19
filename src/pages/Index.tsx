import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-2xl font-bold animate-pulse text-primary">Yuklanmoqda...</div>
    </div>
  );

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, hsl(var(--accent) / 0.2), transparent), radial-gradient(ellipse 50% 30% at 0% 80%, hsl(var(--secondary) / 0.25), transparent)',
        }}
      />
      <motion.div
        className="relative z-10 w-full max-w-md text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="mb-6 text-8xl"
          animate={{ y: [0, -12, 0], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🧮
        </motion.div>

        <h1
          className="mb-3 text-balance text-5xl font-black tracking-tight text-foreground"
          style={{ lineHeight: '1.05' }}
        >
          MathQuest
        </h1>
        <p className="mb-8 text-pretty text-lg font-semibold text-muted-foreground">
          Matematika sizning super kuchingizga aylanadigan sarguzasht! 🚀
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              navigate('/auth');
            }}
            className="w-full rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl sm:min-w-[200px]"
          >
            Sarguzashtni boshlash 🎮
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              navigate('/auth');
            }}
            className="w-full rounded-2xl border-2 border-border bg-card/80 py-4 text-lg font-bold text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted/50 sm:min-w-[160px]"
          >
            Kirish
          </motion.button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Bepul boshlang · Hisobingiz bilan taraqqiyot saqlanadi
        </p>

        <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-6">
          {[
            { n: '4', l: 'Mavzular' },
            { n: '20', l: 'Darslar' },
            { n: '100+', l: 'Savollar' },
          ].map((row) => (
            <div
              key={row.l}
              className="rounded-2xl border border-border/60 bg-card/60 px-2 py-4 text-center shadow-sm backdrop-blur-sm"
            >
              <p className="text-2xl font-black text-foreground">{row.n}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{row.l}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </main>
  );
};

export default Index;
