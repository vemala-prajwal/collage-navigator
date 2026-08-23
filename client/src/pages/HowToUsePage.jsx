import { motion } from 'framer-motion';
<<<<<<< HEAD
import { BookOpen, MapPin, Search, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { fadeUp, pageTransition, staggerContainer } from '../lib/motion';
=======
import { BookOpen, MapPin, Search, ShieldCheck, UtensilsCrossed, Zap, Compass, Layers } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StepFlow from '../components/StepFlow';
import Card from '../components/Card';
import { fadeUp, staggerContainer } from '../lib/motion';
>>>>>>> f3b7adee01245eb9eed63553a02e5219db5e5294
import usePageMeta from '../hooks/usePageMeta';

const STEPS = [
  {
    title: 'Search for your destination',
<<<<<<< HEAD
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
=======
    description: 'Type any building name, room number, or facility to receive instant campus search results with live category filtering.',
    icon: Search,
    action: 'Go to navigation',
    to: '/navigate',
    badge: 'Step 1',
    highlights: ['Instant building search', 'Live room filtering', 'Keyword & location suggestions'],
  },
  {
    title: 'Follow the campus route',
    description: 'Tap any location result to inspect its detail card, then follow turn-by-turn campus paths directly to your destination.',
    icon: MapPin,
    action: 'Open live map',
    to: '/navigate',
    badge: 'Step 2',
    highlights: ['Interactive visual pins', 'Building-to-building routing', 'Estimated walk times'],
  },
  {
    title: 'Check live canteen status',
    description: 'Avoid unnecessary walks by checking food item availability, crowd indicators, and queue updates before heading over.',
    icon: UtensilsCrossed,
    action: 'View canteen menu',
    to: '/canteen',
    badge: 'Step 3',
    highlights: ['Real-time availability status', 'Item category filters', 'Crowd queue alerts'],
  },
  {
    title: 'Share community feedback',
    description: 'Rate campus facilities, post constructive comments, and browse the public feedback feed to help improve student life.',
    icon: ShieldCheck,
    action: 'Submit feedback',
    to: '/feedback',
    badge: 'Step 4',
    highlights: ['5-star rating system', 'Public feedback feed', 'Facility improvement loop'],
>>>>>>> f3b7adee01245eb9eed63553a02e5219db5e5294
  },
];

export default function HowToUsePage() {
  usePageMeta({
    title: 'How to Use',
<<<<<<< HEAD
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
=======
    description: 'Step-by-step interactive onboarding for Campus Navigator. Learn how to search, navigate, check canteen status, and leave feedback.',
  });

  return (
    <div className="how-to-use-page space-y-16">
      {/* Hero Header */}
      <PageHeader
        icon={BookOpen}
        eyebrow="Interactive Guide"
        title="A smoother campus day in four easy steps."
        description="Follow our step-by-step workflow below to search locations, follow live routes, check canteen queues, and leave feedback."
      />

      {/* Main Interactive Stepper Section */}
      <section className="section-container">
        <StepFlow steps={STEPS} />
      </section>

      {/* Why This Design Works Section */}
      <section className="section-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer(0.1, 0.05)}
          className="card-surface glass-panel rounded-3xl border border-border/50 p-8 sm:p-10 shadow-elevated"
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <motion.div variants={fadeUp} className="lg:col-span-5 space-y-4">
              <span className="eyebrow text-accent">Workflow Highlights</span>
              <h2 className="font-display text-3xl font-bold leading-tight text-foreground">
                Engineered for maximum speed and simplicity.
              </h2>
              <p className="text-base leading-relaxed text-foreground-muted">
                Instead of overwhelming users on a single crowded screen, Campus Navigator provides focused views for navigation, dining, and feedback.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="lg:col-span-7 grid gap-4 sm:grid-cols-3">
              <Card title="Zero Guesswork" icon={Zap} className="h-full">
                <p className="text-xs leading-relaxed text-foreground-muted mt-2">
                  Locate buildings and rooms in seconds without asking around campus.
                </p>
              </Card>

              <Card title="Real-Time Data" icon={Compass} className="h-full">
                <p className="text-xs leading-relaxed text-foreground-muted mt-2">
                  Live menu updates prevent wasted trips to crowded canteens.
                </p>
              </Card>

              <Card title="Modular Structure" icon={Layers} className="h-full">
                <p className="text-xs leading-relaxed text-foreground-muted mt-2">
                  Each feature page operates cleanly with unified responsive navigation.
                </p>
              </Card>
            </motion.div>
          </div>
        </motion.div>
>>>>>>> f3b7adee01245eb9eed63553a02e5219db5e5294
      </section>
    </div>
  );
}
