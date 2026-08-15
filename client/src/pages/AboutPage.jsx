import { motion } from 'framer-motion';
import { Building2, Compass, Layers, ShieldCheck, Sparkles, Target, Users, Zap } from 'lucide-react';
import TeamCard from '../components/TeamCard';
import Card from '../components/Card';
import { fadeUp, staggerContainer } from '../lib/motion';
import usePageMeta from '../hooks/usePageMeta';

const TEAM_MEMBERS = [
  { name: 'Vemala Prajwal', initials: 'VP' },
  { name: 'Shreyash Sambrekar', initials: 'SS' },
  { name: 'Rifa Anjum', initials: 'RA' },
  { name: 'Jagriti Singh', initials: 'JS' },
  { name: 'Janya Vani', initials: 'JV' },
];

const IMPACT_STATS = [
  { value: '3x Faster', label: 'Building Discovery', description: 'Students find classrooms without wandering' },
  { value: '100%', label: 'Live Sync', description: 'Real-time canteen availability updates' },
  { value: '< 2 min', label: 'Onboarding Time', description: 'Intuitive workflow for first-time visitors' },
];

export default function AboutPage() {
  usePageMeta({
    title: 'About',
    description: 'Learn about the Campus Navigator project, the team behind it, and our mission to simplify college campus navigation.',
  });

  return (
    <div className="about-page space-y-16">
      {/* ── 1. Hero Section ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface-secondary/80 via-background to-surface/90 border border-border/40 p-8 sm:p-12 lg:p-16 shadow-elevated">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent2/15 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-semibold text-accent">
            <Sparkles size={14} />
            <span>Mission & Vision</span>
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
            Navigating campus life, <br />
            <span className="text-gradient">reimagined for students.</span>
          </h1>

          <p className="text-base text-foreground-muted sm:text-lg leading-relaxed">
            Campus Navigator unifies building search, route navigation, live canteen status, and community feedback into one sleek, dark-themed platform.
          </p>
        </div>
      </section>

      {/* ── 2. The Problem & Solution Section ── */}
      <section className="section-container space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="eyebrow text-accent">Why We Built This</span>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Solving real everyday campus friction.
          </h2>
          <p className="text-sm text-foreground-muted">
            College campuses are vast and fast-moving. We set out to replace physical map confusion and long canteen lines with a smart digital companion.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card icon={Target} title="The Challenge" className="h-full">
            <p className="text-sm leading-relaxed text-foreground-muted">
              Freshmen and visitors frequently struggle to locate obscure lecture halls, administrative offices, and available dining options on busy class days.
            </p>
          </Card>

          <Card icon={Compass} title="Our Solution" className="h-full">
            <p className="text-sm leading-relaxed text-foreground-muted">
              A single responsive web application featuring instant keyword search, live status badges, interactive route paths, and community feedback loops.
            </p>
          </Card>

          <Card icon={ShieldCheck} title="Our Standard" className="h-full">
            <p className="text-sm leading-relaxed text-foreground-muted">
              Built with modern dark theme aesthetics (#080617), smooth 60fps micro-interactions, full keyboard accessibility, and zero intrusive ads.
            </p>
          </Card>
        </div>

        {/* Impact Stats Strip */}
        <div className="grid gap-4 sm:grid-cols-3 pt-4">
          {IMPACT_STATS.map((stat) => (
            <div
              key={stat.label}
              className="card-surface rounded-2xl border border-border/40 p-6 text-center shadow-soft"
            >
              <div className="font-display text-3xl font-extrabold text-gradient">{stat.value}</div>
              <div className="text-sm font-bold text-foreground mt-1">{stat.label}</div>
              <div className="text-xs text-foreground-muted mt-1">{stat.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Team Profiles Section ── */}
      <section className="section-container space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent">
            <Users size={13} />
            <span>Meet the Team</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground">
            The minds behind Campus Navigator
          </h2>
          <p className="text-sm text-foreground-muted max-w-xl">
            Built with dedication by a passionate team of student engineers and designers.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer(0.12, 0.05)}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {TEAM_MEMBERS.map((member) => (
            <motion.div key={member.name} variants={fadeUp}>
              <TeamCard {...member} />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
