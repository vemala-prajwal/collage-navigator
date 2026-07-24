import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';

const routePath = 'M 48 180 Q 120 140 180 120 T 300 80 T 420 100 T 520 60';

export default function HeroPreview({ className = '' }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`premium-card relative aspect-[4/3] overflow-hidden bg-surface/80 dark:bg-surface/60 ${className}`}
      aria-hidden="true"
    >
      <div className="hero-preview-grid absolute inset-0 opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent dark:from-background/95 dark:via-transparent" />

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
            <motion.circle
              r="8"
              fill="rgb(var(--color-accent))"
              opacity="0.3"
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: '100%' }}
              transition={{ duration: 6, ease: 'linear', repeat: Infinity, delay: 1 }}
              style={{ offsetPath: `path('${routePath}')` }}
            />
            <motion.circle
              r="5"
              fill="rgb(var(--color-accent))"
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: '100%' }}
              transition={{ duration: 6, ease: 'linear', repeat: Infinity, delay: 1 }}
              style={{ offsetPath: `path('${routePath}')` }}
            />
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
            <span className="relative block h-3 w-3 rounded-full border-2 border-accent bg-background shadow-[0_0_16px_rgb(var(--color-accent)/0.6)]" />
          </span>
          <span className="rounded-lg border border-border/40 bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted backdrop-blur-md">
            {pin.label}
          </span>
        </motion.div>
      ))}

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-border/40 bg-background/85 px-4 py-3.5 backdrop-blur-xl">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/80">Live route</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">Main Gate → Science Block</p>
        </div>
        <span className="rounded-full bg-accent/20 px-3.5 py-1 text-xs font-bold text-accent">4 min</span>
      </div>
    </div>
  );
}

HeroPreview.propTypes = {
  className: PropTypes.string,
};
