import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal } from '../Reveal';
import { fadeUp, premiumTransition, scaleFade, staggerContainer } from '../../lib/motion';

const STEPS = [
  {
    number: '01',
    title: 'Search your destination',
    description: 'Find any room, building, or campus service with instant smart search.',
    to: '/map-search',
    cta: 'Open search',
  },
  {
    number: '02',
    title: 'See the live route',
    description: 'Get a clear walking path with real-time distance and turn-by-turn guidance.',
    to: '/map-search',
    cta: 'View map',
  },
  {
    number: '03',
    title: 'Check canteen status',
    description: 'See menu availability and queue status before you arrive.',
    to: '/canteen',
    cta: 'See menu',
  },
  {
    number: '04',
    title: 'Leave feedback',
    description: 'Rate facilities and report issues — your voice shapes campus life.',
    to: '/map-search',
    cta: 'Find a location',
  },
];

function ProcessStep({ step, index, total }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={fadeUp}
      className={`process-step group grid gap-6 py-14 md:grid-cols-[auto_1fr] md:gap-16 lg:gap-24 ${
        index < total - 1
          ? 'border-b'
          : ''
      }`}
      style={{ borderColor: 'rgb(var(--color-border)/0.4)' }}
    >
      {/* Big number */}
      <div className="overflow-hidden">
        <motion.span
          className="process-number block"
          initial={reduceMotion ? false : scaleFade.hidden}
          whileInView={reduceMotion ? undefined : scaleFade.visible}
          viewport={{ once: true, amount: 0.5 }}
          transition={premiumTransition(0.6)}
        >
          {step.number}
        </motion.span>
      </div>

      {/* Content */}
      <div className="md:pt-4">
        <h3 className="font-display text-display-sm font-bold text-foreground">
          {step.title}
        </h3>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-foreground-muted">
          {step.description}
        </p>
        <Link
          to={step.to}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold opacity-0 transition-all duration-300 group-hover:opacity-100"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          {step.cta}
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </motion.div>
  );
}

export default function ProcessSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section-gap relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--color-accent)/0.35), transparent)' }}
      />
      <div className="section-container">
        <Reveal>
          <p className="eyebrow mb-6">How it works</p>
          <h2 className="display-headline max-w-3xl">
            Four steps.
            <br />
            <span className="text-gradient italic">Zero confusion.</span>
          </h2>
        </Reveal>

        <motion.div
          className="mt-20 border-t"
          style={{ borderColor: 'rgb(var(--color-border)/0.4)' }}
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true, amount: 0.08 }}
          variants={staggerContainer(0.12, 0.05)}
        >
          {STEPS.map((step, index) => (
            <ProcessStep key={step.number} step={step} index={index} total={STEPS.length} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
