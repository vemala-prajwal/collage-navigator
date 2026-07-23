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
  hover: { y: -6, scale: 1.01, transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } },
};

const heroBadge = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const stats = [
  { label: 'Live locations', value: '120+' },
  { label: 'Canteen updates', value: 'Every 2 min' },
  { label: 'Feedback responses', value: '4.9/5 average' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-24 sm:pb-28 lg:pt-28">
      <AnimatedBackground />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary-500/10 to-transparent opacity-60 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={headlineContainer}
          className="rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-8 shadow-soft backdrop-blur-2xl sm:p-12 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-center lg:gap-8"
        >
          <div>
            <motion.p variants={heroBadge} className="mb-6 inline-flex rounded-full border border-primary-400/20 bg-primary-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-200 shadow-[0_8px_60px_-50px_rgba(59,130,246,0.8)] backdrop-blur-sm">
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
        </div>

          <motion.div variants={revealItem} className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-2 uppercase tracking-[0.22em] text-xs text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>

            <aside className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl sm:p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-primary-200">Campus workflows</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Designed for every screen</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Fluid navigation, live updates, and fast access to canteen and location details with responsive layouts across phones, tablets, and desktops.
              </p>
              <div className="mt-6 grid gap-3">
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Adaptive search</p>
                  <p className="mt-3 text-lg font-semibold text-white">Instant results from anywhere</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Live canteen view</p>
                  <p className="mt-3 text-lg font-semibold text-white">See what’s open in real time</p>
                </div>
              </div>
            </aside>
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
            <motion.article
              key={item.title}
              variants={cardMotion}
              whileHover="hover"
              className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-soft backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
            >
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
