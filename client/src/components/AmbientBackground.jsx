import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useScrollParallax, useSmoothPointer } from '../lib/useBackgroundMotion';

function readAccentColors() {
  const style = getComputedStyle(document.documentElement);
  const parse = (name) => {
    const raw = style.getPropertyValue(name).trim();
    if (!raw) return null;
    const [r, g, b] = raw.split(/\s+/).map(Number);
    return { r, g, b };
  };
  return {
    primary: parse('--color-accent') || { r: 139, g: 92, b: 246 },
    secondary: parse('--color-accent2') || { r: 217, g: 70, b: 239 },
  };
}

function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = 0;
    let height = 0;
    let particles = [];
    let animId = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let visible = true;
    let colors = readAccentColors();

    const particleCount = () =>
      Math.min(64, Math.max(28, Math.floor((window.innerWidth * window.innerHeight) / 22000)));

    const makeParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.2 + 0.4,
      alpha: Math.random() * 0.35 + 0.08,
      pulse: Math.random() * Math.PI * 2,
      useSecondary: Math.random() > 0.55,
    });

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = Array.from({ length: particleCount() }, makeParticle);
    };

    const draw = (time) => {
      if (!visible) {
        animId = requestAnimationFrame(draw);
        return;
      }

      colors = readAccentColors();
      ctx.clearRect(0, 0, width, height);

      const lineDist = width < 768 ? 90 : 130;
      const mouseRadius = 140;

      particles.forEach((p) => {
        const c = p.useSecondary ? colors.secondary : colors.primary;

        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < mouseRadius && dist > 0) {
          const force = ((mouseRadius - dist) / mouseRadius) ** 2;
          p.vx += (dx / dist) * force * 0.35;
          p.vy += (dy / dist) * force * 0.35;
        }

        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        const pulse = 0.85 + Math.sin(time * 0.002 + p.pulse) * 0.15;
        const nearMouse = dist < mouseRadius * 1.4 ? 1.35 : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${p.alpha * nearMouse})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d >= lineDist) continue;

          const c = a.useSecondary ? colors.secondary : colors.primary;
          const alpha = (1 - d / lineDist) ** 2 * 0.12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    const onMouse = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };
    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
    };

    resize();
    animId = requestAnimationFrame(draw);

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="bg-particles" aria-hidden="true" />;
}

export default function AmbientBackground() {
  const reduceMotion = useReducedMotion();
  const motionEnabled = !reduceMotion;

  useSmoothPointer(motionEnabled);
  useScrollParallax(motionEnabled);

  return (
    <div className="ambient-scene" aria-hidden="true">
      <div className="ambient-base" />
      <div className="ambient-mesh ambient-mesh--animated" />
      <div className="ambient-grid" />
      <div className="ambient-beams">
        <div className="ambient-beam ambient-beam--1" />
        <div className="ambient-beam ambient-beam--2" />
        <div className="ambient-beam ambient-beam--3" />
      </div>

      {motionEnabled ? (
        <>
          <div className="ambient-spotlight ambient-spotlight--primary" />
          <div className="ambient-spotlight ambient-spotlight--secondary" />
          <ParticleField />
        </>
      ) : null}

      <div className="ambient-bg">
        <div className="ambient-bg__noise" />
        <div className="ambient-orb-wrap ambient-orb-wrap--slow">
          <motion.div
            className="ambient-orb ambient-orb--primary"
            animate={
              motionEnabled
                ? { x: [0, 50, -35, 0], y: [0, -40, 25, 0], scale: [1, 1.06, 0.98, 1] }
                : undefined
            }
            transition={{ duration: 32, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
          />
        </div>
        <div className="ambient-orb-wrap ambient-orb-wrap--medium">
          <motion.div
            className="ambient-orb ambient-orb--secondary"
            animate={
              motionEnabled
                ? { x: [0, -60, 40, 0], y: [0, 35, -45, 0], scale: [1, 1.08, 1, 1.04] }
                : undefined
            }
            transition={{ duration: 38, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
          />
        </div>
        <div className="ambient-orb-wrap ambient-orb-wrap--fast">
          <motion.div
            className="ambient-orb ambient-orb--accent"
            animate={motionEnabled ? { x: [0, 30, -25, 0], y: [0, -25, 30, 0] } : undefined}
            transition={{ duration: 26, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
          />
        </div>
        <div className="ambient-orb-wrap ambient-orb-wrap--medium">
          <motion.div
            className="ambient-orb ambient-orb--tertiary"
            animate={motionEnabled ? { x: [0, 25, -20, 0], y: [0, -18, 22, 0] } : undefined}
            transition={{ duration: 30, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
          />
        </div>
      </div>

      <div className="ambient-vignette" />
    </div>
  );
}
