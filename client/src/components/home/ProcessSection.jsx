import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal } from '../Reveal';
import { fadeUp, staggerContainer } from '../../lib/motion';

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

function ProcessStep({ step }) {
  return (
    <motion.div
      variants={fadeUp}
      className="card-surface card-static process-step group"
    >
      <div className="card-header">
        <div className="card-header__main">
          <span className="card-header__icon process-step__number" aria-hidden="true">
            {step.number}
          </span>
          <h3 className="card-title">{step.title}</h3>
        </div>
      </div>

      <div className="card-body">
        <p className="max-w-lg text-base leading-relaxed text-foreground-muted">
          {step.description}
        </p>
        <Link
          to={step.to}
          className="mt-0 inline-flex items-center gap-1.5 text-sm font-semibold opacity-100 transition-all duration-300 md:opacity-0 md:group-hover:opacity-100"
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
        style={{ background: 'rgb(var(--ui-accent) / 0.35)' }}
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
          className="mt-14 grid items-stretch gap-4"
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true, amount: 0.08 }}
          variants={staggerContainer(0.12, 0.05)}
        >
          {STEPS.map((step) => (
            <ProcessStep key={step.number} step={step} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
