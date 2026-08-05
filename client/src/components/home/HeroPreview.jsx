import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPinned } from 'lucide-react';
import Badge from '../Badge';

const routePath = 'M 48 180 Q 120 140 180 120 T 300 80 T 420 100 T 520 60';

const TREES = [
  { x: 30, y: 52, s: 0.85, o: 0.72 },
  { x: 66, y: 92, s: 0.68, o: 0.6 },
  { x: 36, y: 132, s: 0.98, o: 0.8 },
  { x: 100, y: 122, s: 0.74, o: 0.68 },
  { x: 62, y: 196, s: 1.02, o: 0.82 },
  { x: 118, y: 216, s: 0.86, o: 0.7 },
  { x: 158, y: 174, s: 0.72, o: 0.64 },
  { x: 196, y: 222, s: 0.94, o: 0.76 },
  { x: 240, y: 172, s: 0.8, o: 0.66 },
  { x: 288, y: 226, s: 1.02, o: 0.8 },
  { x: 342, y: 200, s: 0.82, o: 0.7 },
  { x: 388, y: 224, s: 0.94, o: 0.76 },
  { x: 430, y: 196, s: 0.76, o: 0.64 },
  { x: 474, y: 224, s: 1.02, o: 0.8 },
  { x: 512, y: 196, s: 0.82, o: 0.7 },
  { x: 532, y: 128, s: 0.8, o: 0.68 },
  { x: 512, y: 74, s: 0.68, o: 0.6 },
  { x: 466, y: 40, s: 0.92, o: 0.72 },
  { x: 408, y: 30, s: 0.76, o: 0.62 },
  { x: 346, y: 40, s: 0.88, o: 0.7 },
  { x: 292, y: 34, s: 0.72, o: 0.6 },
  { x: 234, y: 30, s: 0.82, o: 0.68 },
  { x: 176, y: 46, s: 0.94, o: 0.74 },
  { x: 126, y: 84, s: 0.82, o: 0.7 },
  { x: 84, y: 30, s: 0.74, o: 0.6 },
  { x: 210, y: 92, s: 0.72, o: 0.6 },
];

function MapTree({ x, y, s, o }) {
  return (
    <motion.g
      transform={`translate(${x} ${y}) scale(${s})`}
      initial={{ opacity: 0 }}
      animate={{ opacity: o }}
      transition={{ delay: 0.6 + ((x + y) % 20) * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <ellipse cx="0" cy="15" rx="13" ry="2.6" fill="rgb(var(--color-foreground) / 0.07)" />
      <rect x="-1.5" y="8" width="3" height="6.5" rx="1.2" fill="rgb(var(--color-canopy-trunk))" />
      <circle cx="0" cy="-1" r="9.5" fill="rgb(var(--color-canopy))" />
      <circle cx="-6.8" cy="3.4" r="6.4" fill="rgb(var(--color-canopy-deep))" />
      <circle cx="6.8" cy="3.4" r="6.2" fill="rgb(var(--color-canopy))" opacity="0.85" />
    </motion.g>
  );
}

export default function HeroPreview({ className = '' }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`card-surface premium-card premium-card--static relative aspect-[4/3] ${className}`}
      aria-hidden="true"
    >
      <div className="card-header relative z-10">
        <div className="card-header__main">
          <span className="card-header__icon" aria-hidden="true">
            <MapPinned size={16} strokeWidth={1.8} />
          </span>
          <span className="card-title">Live route</span>
        </div>
        <Badge status="available">Active</Badge>
      </div>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 240" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {TREES.map((tree, index) => (
          <MapTree key={index} x={tree.x} y={tree.y} s={tree.s} o={tree.o} />
        ))}

        <motion.path
          d={routePath}
          fill="none"
          stroke="rgb(var(--color-accent))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="6 8"
          filter="url(#route-glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        />

        {!reduceMotion ? (
          <>
            <circle r="8" fill="rgb(var(--color-accent))" opacity="0.3">
              <animateMotion path={routePath} dur="6s" repeatCount="indefinite" />
            </circle>
            <circle r="5" fill="rgb(var(--color-accent))">
              <animateMotion path={routePath} dur="6s" repeatCount="indefinite" />
            </circle>
          </>
        ) : null}
      </svg>

      {[
        { label: 'Library', x: '12%', y: '72%' },
        { label: 'Canteen', x: '52%', y: '28%' },
        { label: 'Lab Block', x: '78%', y: '58%' },
      ].map((pin, i) => (
        <motion.div
          key={pin.label}
          className="absolute flex flex-col items-center gap-1.5"
          style={{ left: pin.x, top: pin.y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="relative">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" style={{ animationDuration: '2s' }} />
            <span className="relative block h-3 w-3 rounded-full border-2 border-accent bg-background" />
          </span>
          <span className="map-preview-pin-label rounded-md border border-border/40 bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
            {pin.label}
          </span>
        </motion.div>
      ))}

      <div className="card-surface card-static route-summary absolute bottom-4 left-4 right-4">
        <div className="card-header">
          <div className="card-header__main">
            <span className="card-header__icon" aria-hidden="true">
              <MapPinned size={14} strokeWidth={1.8} />
            </span>
            <span className="card-title">Route information</span>
          </div>
          <Badge status="available">Live</Badge>
        </div>
        <div className="card-data-grid card-data-grid--two">
          <div className="card-data-item">
            <span className="card-label">Route</span>
            <span className="card-value text-sm">Main Gate → Science Block</span>
          </div>
          <div className="card-data-item">
            <span className="card-label">ETA</span>
            <span className="card-value">4 min</span>
          </div>
        </div>
      </div>
    </div>
  );
}

MapTree.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  s: PropTypes.number.isRequired,
  o: PropTypes.number.isRequired,
};

HeroPreview.propTypes = {
  className: PropTypes.string,
};
