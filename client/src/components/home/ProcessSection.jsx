import { motion, useReducedMotion } from 'framer-motion';
import { Reveal, RevealStagger } from '../Reveal';
import { fadeUp, premiumTransition, scaleFade, staggerContainer } from '../../lib/motion';

const STEPS = [
  {
    number: '01',
    title: 'Search your destination',
    description: 'Find any room, building, or campus service with instant smart search.',
  },
  {
    number: '02',
    title: 'See the live route',
    description: 'Get a clear walking path with real-time distance and turn-by-turn guidance.',
  },
  {
    number: '03',
    title: 'Check canteen status',
    description: 'See menu availability and queue status before you arrive.',
  },
  {
    number: '04',
    title: 'Leave feedback',
    description: 'Rate facilities and report issues — your voice shapes campus life.',
  },
];

function ProcessStep({ step, index, total }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={fadeUp}
      className={`grid gap-6 border-t border-border/50 py-14 md:grid-cols-[auto_1fr] md:gap-16 lg:gap-24 ${
        index === total - 1 ? 'border-b' : ''
      }`}
    >
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
      <div className="md:pt-4">
        <h3 className="font-display text-display-sm font-bold text-foreground">{step.title}</h3>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-foreground-muted">{step.description}</p>
      </div>
    </motion.div>
  );
}

export default function ProcessSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section-gap">
      <div className="section-container">
        <Reveal>
          <p className="eyebrow mb-6">How it works</p>
          <h2 className="display-headline max-w-3xl">
            Four steps.
            <br />
            <span className="font-normal italic text-foreground-muted">Zero confusion.</span>
          </h2>
        </Reveal>

        <motion.div
          className="mt-20 space-y-0"
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
