import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Button from './Button';
import HeroPreview from './home/HeroPreview';
import { premiumTransition, staggerContainer, fadeUp } from '../lib/motion';

const QUICK_STATS = [
  { value: 'Live', label: 'Routes' },
  { value: '2 min', label: 'Canteen sync' },
  { value: '4.9', label: 'Avg rating' },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[92vh] flex-col overflow-hidden pt-12 sm:pt-16 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-hero-gradient" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />

      <div className="section-container relative z-10 flex flex-1 flex-col">
        <div className="grid flex-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            variants={staggerContainer(0.1, 0.05)}
          >
            <motion.p variants={fadeUp} className="eyebrow mb-8">
              Campus navigation, reimagined
            </motion.p>

            <motion.h1 variants={fadeUp} className="display-headline">
              <span className="text-foreground">Find your way</span>
              <br />
              <span className="text-foreground">across campus</span>
              <br />
              <span className="font-normal italic text-foreground-muted">with confidence.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-md text-base leading-relaxed text-foreground-muted sm:text-lg"
            >
              Search destinations, follow live routes, check canteen status, and leave feedback — all in one place.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-center gap-6">
              <Link to="/map-search">
                <Button className="min-w-[200px] px-8 py-4 text-base shadow-glow">Explore Campus</Button>
              </Link>
              <Link
                to="/canteen"
                className="text-sm font-semibold text-foreground-muted transition-colors duration-300 hover:text-foreground"
              >
                View canteen →
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-14 flex flex-wrap gap-3"
            >
              {QUICK_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-full border border-border/50 bg-surface/50 px-4 py-2 backdrop-blur-sm dark:border-white/[0.06] dark:bg-surface/40"
                >
                  <span className="font-display text-sm font-bold text-foreground">{stat.value}</span>
                  <span className="ml-2 text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 48, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ ...premiumTransition(0.8), delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-accent/10 blur-3xl dark:bg-accent/[0.04] dark:blur-[80px]" aria-hidden="true" />
            <HeroPreview className="relative shadow-elevated" />
          </motion.div>
        </div>

        {!reduceMotion ? (
          <motion.a
            href="#discover"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...premiumTransition(0.6), delay: 1 }}
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
