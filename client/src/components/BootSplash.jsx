import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import CampusLogoIcon from './CampusLogo';

/**
 * Boot/Splash Intro Component for College Navigator
 * Plays automatically for 3.0 seconds on initial session load, then smoothly fades out.
 * Session-backed (sessionStorage) so it only plays once per visit.
 */
export default function BootSplash() {
  const reduceMotion = useReducedMotion();

  // Initialize visibility synchronously based on sessionStorage state
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasSeen = sessionStorage.getItem('hasSeenBootSequence');
    return !hasSeen;
  });

  useEffect(() => {
    if (!isVisible) return;

    // Mark as seen for this browser session
    sessionStorage.setItem('hasSeenBootSequence', 'true');

    // Display duration: Fixed 3.0 seconds (or 0.6s for reduced motion)
    const duration = reduceMotion ? 600 : 3000;
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [isVisible, reduceMotion]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="boot-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground select-none overflow-hidden pointer-events-auto"
          aria-label="Campus Navigator loading intro"
        >
          {/* Subtle Ambient Background Mesh & Dot Grid */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,rgb(var(--color-foreground))_1px,transparent_0)] bg-[size:36px_36px]" />
          <div className="absolute h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-[120px] pointer-events-none" />

          <div className="relative flex flex-col items-center justify-center z-10 px-6 text-center">
            {/* Beat 1: Compass / Location Pin Icon Motif scales & draws in first */}
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center justify-center mb-6"
            >
              {/* Outer Pulsing Sonar Ring */}
              {!reduceMotion && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [0.9, 1.35, 0.9], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
                  className="absolute h-28 w-28 rounded-full border border-accent/40 shadow-glow"
                />
              )}

              {/* Brand Logo Container */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent via-accent2 to-warning text-white shadow-glow">
                <CampusLogoIcon />
              </div>
            </motion.div>

            {/* Beat 2: Text & Brand Wordmark follows a beat later */}
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { y: 16, opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
              transition={{ delay: reduceMotion ? 0.2 : 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2"
            >
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Campus <span className="text-gradient">Navigator</span>
              </h1>

              <p className="text-xs sm:text-sm font-medium tracking-wide text-foreground-muted">
                Wayfinding & Live Campus Intelligence
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
