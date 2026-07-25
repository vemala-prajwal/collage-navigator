import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Button from './Button';
import HeroPreview from './home/HeroPreview';
import RealLogo from './RealLogo';
import { premiumTransition, staggerContainer, fadeUp } from '../lib/motion';

const QUICK_STATS = [
  { value: 'Live', label: 'Routes', logo: 'googlemaps' },
  { value: '2 min', label: 'Canteen sync', logo: 'google' },
  { value: '4.9 ★', label: 'Avg rating', logo: 'googlestreetview' },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[96vh] flex-col overflow-hidden pt-12 sm:pt-16 lg:pt-24">
      {/* Background gradients */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'var(--gradient-hero)' }}
        aria-hidden="true"
      />
      <div className="hero-glow" aria-hidden="true" />

      {/* Decorative rings */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        {[600, 800, 1000].map((size, i) => (
          <div
            key={size}
            className="absolute rounded-full border border-accent/[0.06]"
            style={{
              width:  size,
              height: size,
              top:   -size / 2,
              left:  -size / 2,
              animationDuration: `${20 + i * 8}s`,
            }}
          />
        ))}
      </div>

      <div className="section-container relative z-10 flex flex-1 flex-col">
        <div className="grid flex-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">

          {/* ── Left: Text ── */}
          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            variants={staggerContainer(0.1, 0.05)}
          >
            {/* Eyebrow pill */}
            <motion.div variants={fadeUp} className="mb-8">
              <span className="glow-pill">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ background: 'var(--gradient-accent)' }}
                />
                Campus navigation, reimagined
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="display-headline">
              <span className="text-foreground">Find your way</span>
              <br />
              <span className="text-gradient relative inline-block">
                across campus
                {/* Underline beam */}
                <span
                  className="absolute -bottom-2 left-0 h-1 w-full rounded-full opacity-50"
                  style={{ background: 'var(--gradient-accent)' }}
                />
              </span>
              <br />
              <span className="font-normal italic text-foreground-muted">
                with confidence.
              </span>
            </motion.h1>

            {/* Sub text */}
            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-md text-base leading-relaxed text-foreground-muted sm:text-lg"
            >
              Search destinations, follow live routes, check canteen status,
              and leave feedback — all in one beautiful place.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-center gap-5">
              <Link to="/map-search">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="btn-gradient relative inline-flex items-center gap-2 overflow-hidden rounded-full px-8 py-4 text-base font-semibold text-white beam-sweep"
                >
                  <RealLogo slug="googlemaps" color="ffffff" size={18} alt="Google Maps logo" />
                  <span className="relative z-10">Explore Campus</span>
                </motion.button>
              </Link>
              <Link
                to="/canteen"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground-muted transition-all duration-300 hover:text-foreground"
              >
                View canteen
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>

            {/* Stats pills */}
            <motion.div variants={fadeUp} className="mt-14 flex flex-wrap gap-3">
              {QUICK_STATS.map((stat) => {
                return (
                  <motion.div
                    key={stat.label}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="gradient-border flex items-center gap-2 rounded-full border border-border/50 bg-surface/60 px-4 py-2 backdrop-blur-sm"
                  >
                    <RealLogo slug={stat.logo} color="8b5cf6" size={13} alt={`${stat.label} logo`} />
                    <span className="font-display text-sm font-bold text-foreground">{stat.value}</span>
                    <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                      {stat.label}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* ── Right: Preview card ── */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 48, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ ...premiumTransition(0.8), delay: 0.15 }}
            className="relative"
          >
            {/* Outer glow */}
            <div
              className="absolute -inset-6 rounded-3xl opacity-40 blur-3xl"
              style={{ background: 'var(--gradient-accent)' }}
              aria-hidden="true"
            />

            {/* Floating badge — top right */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="floating-badge absolute -right-4 -top-4 z-20 flex items-center gap-2 rounded-2xl border border-border/50 bg-surface/90 px-4 py-2.5 shadow-elevated backdrop-blur-xl"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ background: 'var(--gradient-accent)' }}>
                <RealLogo slug="googlemaps" color="ffffff" size={14} alt="Google Maps logo" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Status</p>
                <p className="text-xs font-bold text-foreground">Live Updates</p>
              </div>
            </motion.div>

            {/* Floating badge — bottom left */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="floating-badge-delayed absolute -bottom-4 -left-4 z-20 flex items-center gap-2 rounded-2xl border border-border/50 bg-surface/90 px-4 py-2.5 shadow-elevated backdrop-blur-xl"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/15">
                <RealLogo slug="googlestreetview" color="10b981" size={14} alt="Street View logo" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Rating</p>
                <p className="text-xs font-bold text-foreground">4.9 / 5.0</p>
              </div>
            </motion.div>

            <HeroPreview className="relative shadow-elevated" />
          </motion.div>
        </div>

        {/* ── Scroll cue ── */}
        {!reduceMotion ? (
          <motion.a
            href="#discover"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...premiumTransition(0.6), delay: 1.2 }}
            className="mt-12 flex flex-col items-center gap-2 self-center text-foreground-muted transition-colors hover:text-foreground lg:mt-8"
            aria-label="Scroll to discover more"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em]">Discover</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
            >
              <ChevronDown size={20} strokeWidth={1.5} />
            </motion.span>
          </motion.a>
        ) : null}
      </div>
    </section>
  );
}
