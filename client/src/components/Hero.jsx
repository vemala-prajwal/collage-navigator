import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';
import Button from './Button';
import Card from './Card';

const headlineContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const revealItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardsContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardMotion = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const stats = [
  { label: 'Live locations', value: '120+' },
  { label: 'Canteen updates', value: 'Every 2 min' },
  { label: 'Feedback responses', value: '4.9/5 average' },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pb-16 pt-8 sm:pb-20">
      <AnimatedBackground />
      <div
        className="pointer-events-none absolute inset-0 bg-hero-gradient opacity-90"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          animate="visible"
          variants={headlineContainer}
          className="glass-panel rounded-3xl p-8 sm:p-12 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:items-center lg:gap-10"
        >
          <div>
            <motion.p
              variants={revealItem}
              className="mb-6 inline-flex rounded-full border border-accent/25 bg-accent-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent"
            >
              Campus navigation reimagined
            </motion.p>

            <motion.h1
              variants={revealItem}
              className="font-display text-display-lg font-extrabold text-foreground"
            >
              <span className="block">Navigate campus with</span>
              <span className="mt-1 block text-accent">clarity, speed, and confidence.</span>
            </motion.h1>

            <motion.p variants={revealItem} className="mt-6 max-w-2xl text-lg text-foreground-muted">
              Discover classrooms, find food, and submit feedback in one polished campus experience
              built for students and staff.
            </motion.p>

            <motion.div variants={revealItem} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link to="/map-search" className="w-full sm:w-auto">
                <Button className="w-full sm:min-w-[180px]">Find a location</Button>
              </Link>
              <Link to="/canteen" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:min-w-[180px]">
                  View canteen
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div variants={revealItem} className="mt-10 lg:mt-0">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border bg-surface-secondary/80 p-5 backdrop-blur-sm"
                >
                  <p className="font-display text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={cardsContainer}
          className="mt-10 grid gap-6 md:grid-cols-3"
        >
          {[
            {
              title: 'Intelligent search',
              description: 'Search rooms, buildings, and services with smart filtering and instant results.',
            },
            {
              title: 'Real-time canteen data',
              description: 'See availability, queue status, and menu highlights for every campus canteen.',
            },
            {
              title: 'Feedback that matters',
              description: 'Submit and track facility feedback with a clean, trusted workflow.',
            },
          ].map((item) => (
            <motion.div key={item.title} variants={cardMotion}>
              <Card variant="glass" className="h-full">
                <p className="eyebrow text-[0.65rem]">Premium feature</p>
                <h2 className="mt-4 font-display text-xl font-bold text-foreground">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-foreground-muted">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
