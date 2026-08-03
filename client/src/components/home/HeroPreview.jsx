import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPinned } from 'lucide-react';
import Badge from '../Badge';

const routePath = 'M 48 180 Q 120 140 180 120 T 300 80 T 420 100 T 520 60';

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

HeroPreview.propTypes = {
  className: PropTypes.string,
};
