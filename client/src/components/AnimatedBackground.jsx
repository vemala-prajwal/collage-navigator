import { useEffect, useMemo, useState } from 'react';

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
      <div className="animated-background__layer animated-background__layer--one" />
      <div className="animated-background__layer animated-background__layer--two" />
      <div className="animated-background__noise" />
    </div>
  );
}
