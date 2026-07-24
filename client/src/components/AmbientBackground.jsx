import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/* ── Canvas particle field ───────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, particles, animId;
    let mouseX = -1000, mouseY = -1000;

    const isDark = () => document.documentElement.classList.contains('dark');

    const resize = () => {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const COLOR_LIGHT = { r: 109, g: 40, b: 217 };
    const COLOR_DARK  = { r: 139, g: 92, b: 246 };

    const getColor = () => isDark() ? COLOR_DARK : COLOR_LIGHT;

    const PARTICLE_COUNT = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 14000));

    const makeParticle = () => {
      const c = getColor();
      return {
        x:     Math.random() * window.innerWidth,
        y:     Math.random() * window.innerHeight,
        vx:    (Math.random() - 0.5) * 0.35,
        vy:    (Math.random() - 0.5) * 0.35,
        r:     Math.random() * 1.6 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        c,
      };
    };

    const init = () => {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
    };

    const LINE_DIST    = 120;
    const MOUSE_REPEL  = 90;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const c = getColor();

      particles.forEach((p) => {
        /* mouse repel */
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL) {
          const force = (MOUSE_REPEL - dist) / MOUSE_REPEL;
          p.vx += (dx / dist) * force * 0.6;
          p.vy += (dy / dist) * force * 0.6;
        }

        /* friction */
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        /* wrap */
        if (p.x < 0)      p.x = width;
        if (p.x > width)  p.x = 0;
        if (p.y < 0)      p.y = height;
        if (p.y > height) p.y = 0;

        /* draw particle */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${p.alpha})`;
        ctx.fill();
      });

      /* draw connecting lines */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < LINE_DIST) {
            const alpha = (1 - d / LINE_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    const onMouse = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    const onLeave = ()  => { mouseX = -1000; mouseY = -1000; };

    init();
    draw();

    window.addEventListener('resize',      resize, { passive: true });
    window.addEventListener('mousemove',   onMouse, { passive: true });
    window.addEventListener('mouseleave',  onLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize',     resize);
      window.removeEventListener('mousemove',  onMouse);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      aria-hidden="true"
    />
  );
}

/* ── Main export ─────────────────────────────────────────────────────── */
export default function AmbientBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Subtle grid */}
      <div className="grid-overlay" aria-hidden="true" />

      {/* Particle canvas */}
      {!reduceMotion && <ParticleCanvas />}

      {/* Blob orbs */}
      <div className="ambient-bg pointer-events-none" aria-hidden="true">
        <div className="ambient-bg__noise" />
        <div className="ambient-mesh" />

        <motion.div
          className="ambient-orb ambient-orb--primary"
          animate={reduceMotion ? undefined : {
            x: [0, 40, -30, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.08, 0.97, 1],
          }}
          transition={{ duration: 28, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
        />

        <motion.div
          className="ambient-orb ambient-orb--secondary"
          animate={reduceMotion ? undefined : {
            x: [0, -50, 30, 0],
            y: [0, 30, -40, 0],
            scale: [1, 1.10, 1, 1.05],
          }}
          transition={{ duration: 34, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
        />

        <motion.div
          className="ambient-orb ambient-orb--accent"
          animate={reduceMotion ? undefined : {
            x: [0, 20, -15, 0],
            y: [0, -20, 25, 0],
          }}
          transition={{ duration: 22, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
        />

        <motion.div
          className="ambient-orb ambient-orb--tertiary"
          animate={reduceMotion ? undefined : {
            x: [0, 30, -20, 0],
            y: [0, -15, 20, 0],
          }}
          transition={{ duration: 26, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
        />
      </div>
    </>
  );
}
