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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 overflow-hidden">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="text-8xl mb-6"
          animate={{ y: [0, -12, 0], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🧮
        </motion.div>

        <h1 className="text-5xl font-black text-foreground mb-3 text-balance" style={{ lineHeight: '1.05' }}>
          MathQuest
        </h1>
        <p className="text-lg text-muted-foreground font-semibold mb-8 text-pretty">
          Matematika sizning super kuchingizga aylanadigan sarguzasht! 🚀
        </p>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth')}
            className="w-full rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl"
          >
            Sarguzashtni boshlash 🎮
          </motion.button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 text-muted-foreground">
          <div className="text-center">
            <p className="text-2xl font-black text-foreground">4</p>
            <p className="text-xs font-semibold">Mavzular</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-foreground">20</p>
            <p className="text-xs font-semibold">Darslar</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-foreground">100+</p>
            <p className="text-xs font-semibold">Savollar</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
