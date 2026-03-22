import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

/** Mobil (PWA) va desktop: xavfsiz zona + mavzu almashtirish */
const ThemeToggleFab = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="fixed z-[100] flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-lg border border-border md:bottom-6 md:right-6"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))', right: 'max(1rem, env(safe-area-inset-right, 0px))' }}
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <motion.button
      type="button"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.94 }}
      className="fixed z-[100] flex h-12 w-12 items-center justify-center rounded-full bg-card text-foreground shadow-lg border-2 border-border hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))', right: 'max(1rem, env(safe-area-inset-right, 0px))' }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Yorug‘ rejim' : 'Qorong‘u rejim'}
      aria-label={isDark ? 'Yorug‘ rejim' : 'Qorong‘u rejim'}
    >
      {isDark ? <Sun className="h-5 w-5 text-quest-yellow" /> : <Moon className="h-5 w-5 text-quest-purple" />}
    </motion.button>
  );
};

export default ThemeToggleFab;
