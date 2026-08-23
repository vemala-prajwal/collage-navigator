import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'cn_boot_splash_seen';

export default function BootSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasSeenSplash = window.sessionStorage.getItem(STORAGE_KEY) === 'true';

    if (!hasSeenSplash) {
      setVisible(true);
      window.sessionStorage.setItem(STORAGE_KEY, 'true');
      const timer = window.setTimeout(() => setVisible(false), 900);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-border/50 bg-surface-secondary/70 px-6 py-4 shadow-elevated"
          >
            <p className="font-display text-xl font-bold text-foreground">Campus Navigator</p>
            <p className="text-xs text-foreground-muted">Preparing your dashboard...</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
