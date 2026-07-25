import { useEffect, useRef } from 'react';

const LERP = 0.075;

export function useSmoothPointer(enabled = true) {
  const target = useRef({ x: 0.5, y: 0.3 });
  const current = useRef({ x: 0.5, y: 0.3 });
  const raf = useRef(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const root = document.documentElement;

    const setVars = (x, y) => {
      root.style.setProperty('--pointer-x', `${x * 100}%`);
      root.style.setProperty('--pointer-y', `${y * 100}%`);
      root.style.setProperty('--pointer-x-px', `${x * window.innerWidth}px`);
      root.style.setProperty('--pointer-y-px', `${y * window.innerHeight}px`);
    };

    const onMove = (event) => {
      target.current = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      };
    };

    const onTouch = (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      target.current = {
        x: touch.clientX / window.innerWidth,
        y: touch.clientY / window.innerHeight,
      };
    };

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * LERP;
      current.current.y += (target.current.y - current.current.y) * LERP;
      setVars(current.current.x, current.current.y);
      raf.current = requestAnimationFrame(tick);
    };

    setVars(current.current.x, current.current.y);
    raf.current = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [enabled]);
}

export function useScrollParallax(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const root = document.documentElement;

    const onScroll = () => {
      const y = window.scrollY;
      root.style.setProperty('--scroll-y', `${y}px`);
      root.style.setProperty('--scroll-progress', `${Math.min(y / (window.innerHeight * 1.2), 1)}`);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled]);
}
