import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/* ── Campus Waypoint Node Network Engine ─────────────────────────────────── */
function CampusNodeCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, animId;
    let mouseX = -1000, mouseY = -1000;
    let sonarPings = [];
    let isTabVisible = true;

    const isDarkTheme = () => document.documentElement.classList.contains('dark');

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    // Location Node Network
    let nodes = [];

    const LABELS = ['Library', 'Tech Block', 'Science Lab', 'Canteen', 'Auditorium', 'Admin Quad', 'Sports Field', 'Hostel Wing', 'Innovation Hub'];

    const initNodes = () => {
      // Responsive node count based on screen area
      const count = Math.min(75, Math.max(24, Math.floor((width * height) / 16000)));
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.75,
          vy: (Math.random() - 0.5) * 0.75,
          radius: Math.random() * 2.2 + 1.8,
          label: i < LABELS.length ? LABELS[i] : null,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };

    const PROXIMITY_RADIUS = 200;
    const CONNECT_DIST = 140;

    const draw = () => {
      if (!isTabVisible) return;
      ctx.clearRect(0, 0, width, height);

      const isDark = isDarkTheme();
      // Theme-adapted color configurations
      const nodeColor = isDark ? '239, 68, 68' : '2, 132, 199';      // Flame Red / Sky Cyan
      const accentColor = isDark ? '249, 115, 22' : '234, 88, 12';    // Sunfire Orange
      const highlightColor = isDark ? '245, 158, 11' : '255, 83, 118'; // Sunlit Amber

      // ── 1. Update & Render Sonar Wave Pings ──
      sonarPings = sonarPings.filter((ping) => ping.alpha > 0.01);
      sonarPings.forEach((ping) => {
        ping.radius += ping.speed;
        ping.alpha *= 0.94;

        ctx.beginPath();
        ctx.arc(ping.x, ping.y, ping.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${nodeColor}, ${ping.alpha * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ping.x, ping.y, ping.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${accentColor}, ${ping.alpha * 0.35})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // ── 2. Update Node Positions & Steering ──
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.pulse += 0.03;

        // Drift motion
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off canvas boundaries smoothly
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Cursor attraction proximity
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < PROXIMITY_RADIUS && dist > 0) {
          const force = (1 - dist / PROXIMITY_RADIUS) * 0.04;
          node.x += (dx / dist) * force * 15;
          node.y += (dy / dist) * force * 15;
        }

        // ── 3. Draw Connecting Route Vector Lines ──
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const ndx = nodeB.x - node.x;
          const ndy = nodeB.y - node.y;
          const nDist = Math.sqrt(ndx * ndx + ndy * ndy);

          if (nDist < CONNECT_DIST) {
            let lineAlpha = (1 - nDist / CONNECT_DIST) * (isDark ? 0.28 : 0.20);

            // Boost opacity near cursor or sonar ping
            if (dist < PROXIMITY_RADIUS) {
              lineAlpha = Math.min(0.65, lineAlpha * 2.5);
            }

            sonarPings.forEach((ping) => {
              const pDist = Math.sqrt((ping.x - node.x) ** 2 + (ping.y - node.y) ** 2);
              if (Math.abs(pDist - ping.radius) < 40) {
                lineAlpha = Math.min(0.85, lineAlpha + ping.alpha * 0.7);
              }
            });

            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(${nodeColor}, ${lineAlpha})`;
            ctx.lineWidth = lineAlpha > 0.4 ? 1.2 : 0.7;
            ctx.stroke();
          }
        }

        // ── 4. Render Node Waypoints & Glow Halos ──
        const isHovered = dist < PROXIMITY_RADIUS;
        const nodeAlpha = isDark ? (isHovered ? 0.95 : 0.55) : (isHovered ? 0.90 : 0.45);
        const rScale = isHovered ? node.radius * 1.5 : node.radius;

        // Outer Glow Halo
        ctx.beginPath();
        ctx.arc(node.x, node.y, rScale + Math.sin(node.pulse) * 1.5 + (isHovered ? 6 : 2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${isHovered ? accentColor : nodeColor}, ${nodeAlpha * 0.22})`;
        ctx.fill();

        // Core Solid Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, rScale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${isHovered ? highlightColor : nodeColor}, ${nodeAlpha})`;
        ctx.fill();

        // Render Location Label on Hover / Special Nodes
        if (node.label && (isHovered || i < 4)) {
          ctx.font = '10px "Space Grotesk", sans-serif';
          ctx.fillStyle = `rgba(${isDark ? '252, 248, 246' : '15, 23, 42'}, ${isHovered ? 0.9 : 0.45})`;
          ctx.fillText(node.label, node.x + 10, node.y + 3);
        }
      }

      // ── 5. Cursor Beacon Halo ──
      if (mouseX > 0 && mouseY > 0) {
        const radGrad = ctx.createRadialGradient(mouseX, mouseY, 4, mouseX, mouseY, PROXIMITY_RADIUS);
        radGrad.addColorStop(0, `rgba(${nodeColor}, ${isDark ? 0.14 : 0.08})`);
        radGrad.addColorStop(0.5, `rgba(${accentColor}, ${isDark ? 0.06 : 0.04})`);
        radGrad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, PROXIMITY_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = radGrad;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    const onMouse = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onClick = (e) => {
      sonarPings.push({
        x: e.clientX,
        y: e.clientY,
        radius: 6,
        speed: 9,
        alpha: 0.90,
      });
    };

    const onLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        animId = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(animId);
      }
    };

    resize();
    draw();

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('click', onClick, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('click', onClick);
      window.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-85 dark:opacity-90"
      aria-hidden="true"
    />
  );
}

/* ── Shared Layout Ambient Background Component ─────────────────────────── */
export default function AmbientBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* 1. Base Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background opacity-95" />

      {/* 2. Interactive Campus Node Network Canvas */}
      {!reduceMotion && <CampusNodeCanvas />}

      {/* 3. Soft Ambient Color Orbs */}
      <motion.div
        className="absolute -top-32 -left-32 h-[30rem] w-[30rem] rounded-full bg-accent/8 dark:bg-accent/12 blur-[130px]"
        animate={reduceMotion ? undefined : {
          x: [0, 25, -15, 0],
          y: [0, -15, 25, 0],
        }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
      />

      <motion.div
        className="absolute top-1/2 -right-32 h-[34rem] w-[34rem] rounded-full bg-accent2/8 dark:bg-accent2/12 blur-[150px]"
        animate={reduceMotion ? undefined : {
          x: [0, -30, 15, 0],
          y: [0, 25, -20, 0],
        }}
        transition={{ duration: 34, ease: 'linear', repeat: Infinity }}
      />
    </div>
  );
}
