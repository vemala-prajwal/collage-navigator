import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';
import Button from './Button';

const headlineContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const revealItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.64, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardsContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.18,
    },
  },
};

const cardMotion = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const stats = [
  { label: 'Live locations', value: '120+' },
  { label: 'Canteen updates', value: 'Every 2 min' },
  { label: 'Feedback responses', value: '4.9/5 average' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-24">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={headlineContainer}
          className="rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-8 shadow-soft backdrop-blur-2xl sm:p-12"
        >
          <motion.p variants={revealItem} className="mb-6 inline-flex rounded-full bg-primary-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-200">
            Campus navigation reimagined
          </motion.p>

          <motion.h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-[4.25rem] lg:leading-[4.5rem]">
            <motion.span className="block overflow-hidden">
              <motion.span variants={revealItem} className="block">
                Navigate campus with
              </motion.span>
            </motion.span>
            <motion.span className="block overflow-hidden">
              <motion.span variants={revealItem} className="block text-primary-300">
                clarity, speed, and confidence.
              </motion.span>
            </motion.span>
          </motion.h1>

          <motion.p variants={revealItem} className="mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
            Discover classrooms, find food, and submit feedback in one polished campus experience built for students and staff.
          </motion.p>

          <motion.div variants={revealItem} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link to="/locations" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto" variant="primary">
                Find a Location
              </Button>
            </Link>
            <Link to="/canteen" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto" variant="secondary">
                View Canteen
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={revealItem} className="mt-12 grid gap-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                <p className="text-2xl font-semibold text-white">{item.value}</p>
                <p className="mt-2 uppercase tracking-[0.22em] text-xs text-slate-400">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={cardsContainer}
          className="mt-14 grid gap-6 md:grid-cols-3"
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
            <motion.article key={item.title} variants={cardMotion} className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-soft backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-primary-200">Premium feature</p>
              <h2 className="mt-4 text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
