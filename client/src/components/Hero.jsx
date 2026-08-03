import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import HeroPreview from './home/HeroPreview';
import RealLogo from './RealLogo';
import Badge from './Badge';
import { premiumTransition, staggerContainer, fadeUp } from '../lib/motion';

const QUICK_STATS = [
  { value: 'Live', label: 'Routes', logo: 'googlemaps' },
  { value: '2 min', label: 'Canteen sync', logo: 'google' },
  { value: '4.9 ★', label: 'Avg rating', logo: 'googlestreetview' },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="hero-section relative flex min-h-[calc(100vh-4.5rem)] flex-col overflow-hidden pt-10 sm:pt-14 lg:pt-20">
      {/* Background gradients */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'var(--gradient-hero)' }}
        aria-hidden="true"
      />

      {/* Decorative rings */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        {[520, 720, 920].map((size, i) => (
          <div
            key={size}
            className="hero-ring absolute rounded-full border border-accent/[0.07]"
            style={{
              width: size,
              height: size,
              top: -size / 2,
              left: -size / 2,
              animationDuration: `${40 + i * 20}s`,
            }}
          />
        ))}
      </div>

      <div className="section-container relative z-10 flex flex-1 flex-col">
          <div className="grid flex-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* ── Left: Text ── */}
          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            variants={staggerContainer(0.1, 0.05)}
            className="hero-copy"
          >
            {/* Eyebrow pill */}
              <motion.div variants={fadeUp} className="hero-kicker-wrap mb-7">
              <span className="hero-kicker">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: 'rgb(var(--ui-accent))' }}
                />
                Campus navigation, reimagined
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="hero-title display-headline">
              <span className="text-foreground">Find your way</span>
              <br />
              <span className="text-gradient relative inline-block">
                across campus
                {/* Underline beam */}
                <span
                  className="absolute -bottom-2 left-0 h-1 w-full rounded-full opacity-50"
                  style={{ background: 'rgb(var(--ui-accent))' }}
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
              className="mt-7 max-w-md text-base leading-relaxed text-foreground-muted sm:text-lg"
            >
              Search destinations, follow live routes, check canteen status,
              and leave feedback — all in one place.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="hero-actions mt-10 flex flex-wrap items-center gap-5">
              <Link to="/map-search">
                <button
                  type="button"
                  className="btn-gradient relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-7 py-3.5 text-base font-semibold text-white"
                >
                  <RealLogo slug="googlemaps" color="ffffff" size={18} alt="Google Maps logo" />
                  <span className="relative z-10">Explore Campus</span>
                </button>
              </Link>
              <Link
                to="/canteen"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground-muted hover:text-foreground"
              >
                View canteen
                <span>→</span>
              </Link>
            </motion.div>

            {/* Stats pills */}
            <motion.div variants={fadeUp} className="hero-stats mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {QUICK_STATS.map((stat) => {
                return (
                  <div
                    key={stat.label}
                    className="card-surface card-static hero-stat"
                  >
                    <div className="card-header">
                      <div className="card-header__main">
                        <span className="card-header__icon" aria-hidden="true">
                          <RealLogo slug={stat.logo} color="8b5cf6" size={13} alt="" />
                        </span>
                        <span className="card-title">{stat.label}</span>
                      </div>
                    </div>
                    <div className="card-data-item">
                      <span className="card-label">Current value</span>
                      <span className="card-value">{stat.value}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* ── Right: Preview card (No background glow behind it) ── */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 48, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ ...premiumTransition(0.8), delay: 0.15 }}
            className="hero-visual relative"
          >
            {/* Floating badge — top right */}
            <div className="card-surface card-static hero-live-card hero-float-card absolute -right-4 -top-4 z-20">
              <div className="card-header">
                <div className="card-header__main">
                  <span className="card-header__icon" aria-hidden="true">
                    <RealLogo slug="googlemaps" color="8b5cf6" size={14} alt="" />
                  </span>
                  <span className="card-title">Status</span>
                </div>
                <Badge status="available">Live</Badge>
              </div>
              <div className="card-data-item">
                <span className="card-label">Current state</span>
                <span className="card-value text-sm">Live updates</span>
              </div>
            </div>

            {/* Floating badge — bottom left */}
            <div className="card-surface card-static hero-rating-card hero-float-card absolute -bottom-4 -left-4 z-20">
              <div className="card-header">
                <div className="card-header__main">
                  <span className="card-header__icon" aria-hidden="true">
                    <RealLogo slug="googlestreetview" color="10b981" size={14} alt="" />
                  </span>
                  <span className="card-title">Rating</span>
                </div>
              </div>
              <div className="card-data-item">
                <span className="card-label">Average score</span>
                <span className="card-value text-sm">4.9 / 5.0</span>
              </div>
            </div>

            <HeroPreview className="relative" />
          </motion.div>
        </div>

        {/* ── Scroll cue ── */}
        {!reduceMotion ? (
            <a
              href="#discover"
              className="hero-scroll-cue mt-12 flex flex-col items-center gap-2 self-center text-foreground-muted hover:text-foreground lg:mt-8"
            aria-label="Scroll to discover more"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em]">Discover</span>
            <ChevronDown size={20} strokeWidth={1.5} />
          </a>
        ) : null}
      </div>
    </section>
  );
}
