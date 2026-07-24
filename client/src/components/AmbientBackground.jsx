import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────
 *  LAYER 1 · Animated mesh gradient (Stripe / Linear style)
 *  Draws softly-animated colour blobs on a canvas using radial gradients.
 *  Blobs move in sinusoidal paths so the colour field constantly shifts.
 * ───────────────────────────────────────────────────────────────────────── */
function MeshCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h, animId;
    let t = 0;

    const isDark = () => document.documentElement.classList.contains('dark');

    /* Each blob: fractional position (0-1), radius (fraction of min dim),
       RGB colour, phase offsets for the Lissajous drift               */
    const BLOBS = [
      { bx: 0.18, by: 0.20, r: 0.52, col: [109, 40, 217],  px: 0.00, py: 0.00, sx: 0.00018, sy: 0.00013 },
      { bx: 0.82, by: 0.25, r: 0.46, col: [217, 70, 239],  px: 1.20, py: 2.10, sx: 0.00013, sy: 0.00018 },
      { bx: 0.50, by: 0.72, r: 0.42, col: [139, 92, 246],  px: 2.40, py: 0.80, sx: 0.00016, sy: 0.00012 },
      { bx: 0.12, by: 0.78, r: 0.34, col: [167, 139, 250], px: 3.60, py: 1.60, sx: 0.00011, sy: 0.00020 },
      { bx: 0.88, by: 0.68, r: 0.40, col: [192, 132, 252], px: 0.80, py: 3.20, sx: 0.00019, sy: 0.00014 },
      { bx: 0.55, by: 0.15, r: 0.30, col: [240, 100, 255], px: 4.20, py: 1.00, sx: 0.00014, sy: 0.00017 },
    ];

    const resize = () => {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, w, h);

      /* Blob alpha: barely visible → creates atmosphere not distraction */
      const blobAlpha = isDark() ? 0.13 : 0.09;

      BLOBS.forEach((b) => {
        const driftX = Math.sin(t * b.sx + b.px) * 0.18;
        const driftY = Math.cos(t * b.sy + b.py) * 0.14;
        const cx = (b.bx + driftX) * w;
        const cy = (b.by + driftY) * h;
        const radius = b.r * Math.min(w, h);

        /* Subtle size breathing */
        const breathe = 1 + Math.sin(t * 0.00025 + b.px) * 0.06;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * breathe);
        grad.addColorStop(0,   `rgba(${b.col[0]},${b.col[1]},${b.col[2]},${blobAlpha})`);
        grad.addColorStop(0.4, `rgba(${b.col[0]},${b.col[1]},${b.col[2]},${blobAlpha * 0.5})`);
        grad.addColorStop(1,   `rgba(${b.col[0]},${b.col[1]},${b.col[2]},0)`);

        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius * breathe, radius * breathe * 0.85, t * 0.0001, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize, { passive: true });
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        zIndex: -8, pointerEvents: 'none',
        opacity: 1,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 *  LAYER 2 · Mouse-spotlight reveal (large area, CSS-variable driven)
 *  A 700 px radial gradient follows the cursor — reveals the mesh below
 *  with a soft "flashlight" feel.  Pure CSS, zero layout work.
 * ───────────────────────────────────────────────────────────────────────── */
function MouseSpotlight() {
  useEffect(() => {
    const set = (e) => {
      document.documentElement.style.setProperty('--spot-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--spot-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', set, { passive: true });
    return () => window.removeEventListener('mousemove', set);
  }, []);
  return null; // rendered purely via .mouse-spotlight CSS class
}

/* ─────────────────────────────────────────────────────────────────────────
 *  LAYER 3 · Particle network canvas
 *  • Two particle sizes: "stars" (tiny, fast) and "nodes" (larger, slow)
 *  • Mouse: nearby particles are gently attracted then snap away → elastic
 *  • Nodes connect with gradient lines whose opacity scales with proximity
 *  • Particles near the mouse glow brighter
 * ───────────────────────────────────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h, animId;
    let mouseX = -9999, mouseY = -9999;

    const isDark = () => document.documentElement.classList.contains('dark');

    const resize = () => {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    /* Two accent colours that interpolate based on position */
    const C1_L = [109, 40, 217];   // violet light
    const C2_L = [217, 70, 239];   // fuchsia light
    const C1_D = [139, 92, 246];   // violet dark
    const C2_D = [240, 100, 255];  // pink dark

    const lerpColor = (a, b, t) =>
      a.map((v, i) => Math.round(v + (b[i] - v) * t));

    const makeParticle = (type = 'node') => {
      const x = Math.random() * (w || window.innerWidth);
      const y = Math.random() * (h || window.innerHeight);
      return {
        x, y,
        ox: x, oy: y,           // original position for springs
        vx: (Math.random() - 0.5) * (type === 'star' ? 0.5 : 0.25),
        vy: (Math.random() - 0.5) * (type === 'star' ? 0.5 : 0.25),
        r: type === 'star'
          ? Math.random() * 1.2 + 0.3
          : Math.random() * 2.2 + 0.8,
        alpha: type === 'star'
          ? Math.random() * 0.35 + 0.08
          : Math.random() * 0.55 + 0.15,
        type,
        colorT: Math.random(),   // 0→C1, 1→C2
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      };
    };

    let particles = [];

    const init = () => {
      resize();
      const area = w * h;
      const nodeCount = Math.min(60, Math.floor(area / 18000));
      const starCount = Math.min(80, Math.floor(area / 12000));
      particles = [
        ...Array.from({ length: nodeCount }, () => makeParticle('node')),
        ...Array.from({ length: starCount }, () => makeParticle('star')),
      ];
    };

    const LINE_DIST   = 140;
    const REPEL_R     = 110;
    const REPEL_FORCE = 0.8;

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      const c1 = isDark() ? C1_D : C1_L;
      const c2 = isDark() ? C2_D : C2_L;

      /* ── Update & draw particles ── */
      particles.forEach((p) => {
        /* Twinkle alpha */
        const tw = 1 + Math.sin(frame * p.twinkleSpeed + p.twinklePhase) * 0.3;
        const a  = Math.min(1, p.alpha * tw);

        /* Mouse repel */
        const dx   = p.x - mouseX;
        const dy   = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < REPEL_R && dist > 0.1) {
          const force = ((REPEL_R - dist) / REPEL_R) * REPEL_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        /* Friction */
        p.vx *= 0.96;
        p.vy *= 0.96;

        p.x += p.vx;
        p.y += p.vy;

        /* Soft-wrap (fade through edges) */
        if (p.x < -10)     p.x = w + 10;
        if (p.x > w + 10)  p.x = -10;
        if (p.y < -10)     p.y = h + 10;
        if (p.y > h + 10)  p.y = -10;

        /* Colour by position/colorT */
        const col = lerpColor(c1, c2, p.colorT);

        /* Glow near mouse */
        const mouseDist = Math.hypot(p.x - mouseX, p.y - mouseY);
        const glowBoost = mouseDist < 200
          ? (1 - mouseDist / 200) * (p.type === 'node' ? 2.5 : 1.5)
          : 0;
        const finalAlpha = Math.min(1, a + glowBoost * 0.4);
        const finalR     = p.r * (1 + glowBoost * 0.5);

        /* Glow shadow for nodes near mouse */
        if (glowBoost > 0.3 && p.type === 'node') {
          ctx.shadowBlur   = 12 * glowBoost;
          ctx.shadowColor  = `rgba(${col[0]},${col[1]},${col[2]},0.8)`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, finalR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${finalAlpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      /* ── Connecting lines (nodes only, with gradient strokes) ── */
      const nodes = particles.filter((p) => p.type === 'node');
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d  = Math.hypot(dx, dy);
          if (d < LINE_DIST) {
            const t      = 1 - d / LINE_DIST;
            const alpha  = t * t * 0.22; // quadratic falloff

            /* Gradient line from a's colour → b's colour */
            const colA = lerpColor(c1, c2, a.colorT);
            const colB = lerpColor(c1, c2, b.colorT);
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(${colA[0]},${colA[1]},${colA[2]},${alpha})`);
            grad.addColorStop(1, `rgba(${colB[0]},${colB[1]},${colB[2]},${alpha})`);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth   = t * 1.2;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    const onMouse = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    const onLeave = ()  => { mouseX = -9999;      mouseY = -9999; };

    init();
    draw();

    window.addEventListener('resize',     () => { resize(); init(); }, { passive: true });
    window.addEventListener('mousemove',  onMouse, { passive: true });
    window.addEventListener('mouseleave', onLeave);

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
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        zIndex: -6, pointerEvents: 'none',
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 *  ROOT EXPORT
 *  Z-index stack (lowest → highest):
 *   -10  dot-grid CSS
 *    -9  ambient CSS noise/orbs
 *    -8  MeshCanvas (animated gradient blobs)
 *    -7  mouse-spotlight CSS
 *    -6  ParticleCanvas
 * ───────────────────────────────────────────────────────────────────────── */
export default function AmbientBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Dot grid */}
      <div className="dot-grid" aria-hidden="true" />

      {/* Noise texture + CSS orbs */}
      <div className="ambient-bg pointer-events-none" aria-hidden="true">
        <div className="ambient-bg__noise" />

        {/* Primary orb — top left */}
        <motion.div
          className="ambient-orb ambient-orb--primary"
          animate={reduceMotion ? undefined : {
            x: [0, 50, -35, 0], y: [0, -35, 25, 0], scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 30, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
        />

        {/* Secondary orb — bottom right */}
        <motion.div
          className="ambient-orb ambient-orb--secondary"
          animate={reduceMotion ? undefined : {
            x: [0, -60, 40, 0], y: [0, 40, -50, 0], scale: [1, 1.12, 1, 1.06],
          }}
          transition={{ duration: 36, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
        />

        {/* Accent orb — centre */}
        <motion.div
          className="ambient-orb ambient-orb--accent"
          animate={reduceMotion ? undefined : {
            x: [0, 25, -20, 0], y: [0, -25, 30, 0],
          }}
          transition={{ duration: 24, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
        />

        {/* Tertiary orb — bottom left */}
        <motion.div
          className="ambient-orb ambient-orb--tertiary"
          animate={reduceMotion ? undefined : {
            x: [0, 35, -25, 0], y: [0, -18, 28, 0],
          }}
          transition={{ duration: 28, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
        />
      </div>

      {/* Animated mesh gradient canvas */}
      {!reduceMotion && <MeshCanvas />}

      {/* Mouse spotlight (CSS-driven, no JS render cost) */}
      {!reduceMotion && <MouseSpotlight />}
      <div className="mouse-spotlight" aria-hidden="true" />

      {/* Particle network canvas */}
      {!reduceMotion && <ParticleCanvas />}
    </>
  );
}
