import { motion } from 'framer-motion';
import { BookOpen, MapPin, Search, ShieldCheck, UtensilsCrossed, Zap, Compass, Layers } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StepFlow from '../components/StepFlow';
import Card from '../components/Card';
import { fadeUp, staggerContainer } from '../lib/motion';
import usePageMeta from '../hooks/usePageMeta';

const STEPS = [
  {
    title: 'Search for your destination',
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
  },
];

export default function HowToUsePage() {
  usePageMeta({
    title: 'How to Use',
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
      </section>
    </div>
  );
}
