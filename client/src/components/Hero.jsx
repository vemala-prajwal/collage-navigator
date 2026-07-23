import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Button from './Button';
import HeroPreview from './home/HeroPreview';
import { premiumTransition, staggerContainer, fadeUp } from '../lib/motion';

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[92vh] overflow-hidden pt-12 sm:pt-16 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-hero-gradient" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />

      <div className="section-container relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
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

            <motion.div variants={fadeUp} className="mt-12 flex items-center gap-6">
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
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 48, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ ...premiumTransition(0.8), delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-accent/10 blur-3xl" aria-hidden="true" />
            <HeroPreview className="relative shadow-elevated" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
