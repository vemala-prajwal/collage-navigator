import { motion } from 'framer-motion';
import { BookOpen, MapPin, Search, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { fadeUp, pageTransition, staggerContainer } from '../lib/motion';
import usePageMeta from '../hooks/usePageMeta';

const STEPS = [
  {
    title: 'Search for your destination',
    description: 'Type a building name, room number, or facility to see instant campus results with live filtering.',
    icon: Search,
    action: 'Go to navigation',
    to: '/navigate',
  },
  {
    title: 'Follow the route',
    description: 'Tap any search result to view its details, then follow the campus route to reach it faster.',
    icon: MapPin,
    action: 'Open map',
    to: '/navigate',
  },
  {
    title: 'Check canteen status',
    description: 'Review live menu availability and crowd levels before you walk to the canteen.',
    icon: UtensilsCrossed,
    action: 'See canteen',
    to: '/canteen',
  },
  {
    title: 'Leave feedback',
    description: 'Share ratings, comments, and suggestions to help classmates and campus teams.',
    icon: ShieldCheck,
    action: 'Give feedback',
    to: '/feedback',
  },
];

export default function HowToUsePage() {
  usePageMeta({
    title: 'How to Use',
    description: 'Step-by-step onboarding for Campus Navigator. Learn how to search, navigate, check canteen status, and leave feedback.',
  });

  return (
    <div className="how-to-use-page space-y-10">
      <PageHeader
        icon={BookOpen}
        eyebrow="How to use"
        title="A faster campus day starts with a few quick steps."
        description="Follow the path below to search destinations, follow live routes, check food status, and leave useful feedback."
      />

      <section className="grid gap-5 lg:grid-cols-2">
        {STEPS.map((step, index) => (
          <motion.article
            key={step.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeUp}
            className="card-surface card-interactive flex flex-col gap-5 rounded-3xl p-6"
          >
            <div className="flex items-start gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <step.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-accent/80">Step {index + 1}</p>
                <h2 className="mt-3 text-xl font-semibold text-foreground">{step.title}</h2>
              </div>
            </div>
            <p className="text-base leading-7 text-foreground-muted">{step.description}</p>
            <Link
              to={step.to}
              className="mt-auto inline-flex items-center justify-between rounded-2xl border border-border/60 bg-surface px-4 py-3 text-sm font-semibold text-accent transition hover:border-accent/80 hover:bg-surface-elevated"
            >
              <span>{step.action}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </motion.article>
        ))}
      </section>

      <section className="section-gap">
        <div className="card-surface glass-panel rounded-[2rem] border-border/40 p-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="eyebrow mb-4">Why this works</p>
              <h2 className="font-display text-3xl font-bold leading-tight text-foreground">A dedicated page for every major campus action.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-foreground-muted">
                Campus Navigator separates search, routing, dining, and feedback into clean workflows so students can move from discovery to action without distraction.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="Faster choices" className="h-full">
                <p className="text-sm leading-relaxed text-foreground-muted">Discover the right building or service in a few keystrokes and avoid campus guesswork.</p>
              </Card>
              <Card title="Clear next steps" className="h-full">
                <p className="text-sm leading-relaxed text-foreground-muted">Each feature page focuses on one task, with consistent navigation and familiar controls.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
