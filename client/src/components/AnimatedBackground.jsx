import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const primaryBlobMotion = {
  animate: {
    x: [0, 18, 0, -18, 0],
    y: [0, -12, 10, -8, 0],
    scale: [1, 1.04, 0.98, 1.02, 1],
    transition: {
      duration: 26,
      ease: [0.16, 1, 0.3, 1],
      repeat: Infinity,
      repeatType: 'mirror',
    },
  },
};

const accentBlobMotion = {
  animate: {
    x: [0, -14, 0, 16, 0],
    y: [0, 10, -14, 12, 0],
    scale: [1, 1.03, 1.05, 1, 1],
    transition: {
      duration: 30,
      ease: [0.16, 1, 0.3, 1],
      repeat: Infinity,
      repeatType: 'mirror',
    },
  },
};

export default function AnimatedBackground({ className = '' }) {
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (event) => setPrefersReducedMotion(event.matches);
    const handleVisibilityChange = () => setIsVisible(document.visibilityState === 'visible');

    mediaQuery.addEventListener?.('change', handleMotionChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mediaQuery.removeEventListener?.('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const wrapperClasses = useMemo(() => {
    const classes = ['animated-background'];
    if (!isVisible || prefersReducedMotion) classes.push('animated-background--static');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [className, isVisible, prefersReducedMotion]);

  return (
    <div className={wrapperClasses} aria-hidden="true">
      <motion.div
        className="animated-background__blob animated-background__blob--primary"
        {...(prefersReducedMotion || !isVisible ? {} : primaryBlobMotion)}
      />
      <motion.div
        className="animated-background__blob animated-background__blob--accent"
        {...(prefersReducedMotion || !isVisible ? {} : accentBlobMotion)}
      />
      <div className="animated-background__noise" />
    </div>
  );
}
