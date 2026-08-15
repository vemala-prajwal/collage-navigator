import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass, MapPin, MessageSquare, Shield, UtensilsCrossed, Zap } from 'lucide-react';
import Hero from '../components/Hero';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { fadeUp, staggerContainer } from '../lib/motion';
import usePageMeta from '../hooks/usePageMeta';

const QUICK_LINKS = [
  {
    title: 'Search & Navigate',
    description: 'Find buildings, rooms, and live campus routes with turn-by-turn guidance.',
    to: '/navigate',
    icon: MapPin,
    status: 'Live map',
    accent: 'from-accent/25 via-accent2/20 to-warning/15',
  },
  {
    title: 'Canteen Status',
    description: 'Check menu item availability and crowd level updates before walking over.',
    to: '/canteen',
    icon: UtensilsCrossed,
    status: 'Real-time sync',
    accent: 'from-accent2/25 via-accent/20 to-warning/15',
  },
  {
    title: 'Community Feedback',
    description: 'Share ratings, facility suggestions, and read student reviews.',
    to: '/feedback',
    icon: MessageSquare,
    status: 'Community-first',
    accent: 'from-warning/25 via-accent2/20 to-accent/15',
  },
  {
    title: 'How to Use',
    description: 'Step-by-step workflow guide to master the platform in under a minute.',
    to: '/how-to-use',
    icon: BookOpen,
    status: 'Step-by-step',
    accent: 'from-accent/25 via-warning/20 to-accent2/15',
  },
];

export default function HomePage() {
  usePageMeta({
    title: 'Home',
    description: 'Campus Navigator home page for quick access to campus search, navigation, canteen status, and feedback.',
  });

  return (
    <div className="home-page space-y-20 pb-12">
      <Hero />

      {/* Quick Access Feature Cards */}
      <section id="discover" className="section-container">
        <div className="space-y-4 mb-8">
          <span className="eyebrow text-accent">Quick Launch</span>
          <h2 className="font-display text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
            Everything you need, <span className="bg-gradient-to-r from-accent2 via-accent2 to-warning bg-clip-text text-transparent">one tap away.</span>
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer(0.1, 0.05)}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <motion.div key={link.title} variants={fadeUp}>
                <Link to={link.to} className="group block h-full">
                  <div className="card-surface glass-panel-interactive rounded-3xl p-6 h-full flex flex-col justify-between border border-border/50 transition-all duration-300">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${link.accent} border border-accent/25 text-accent group-hover:scale-110 transition-transform duration-300 shadow-soft`}>
                          <Icon size={22} />
                        </div>
                        <Badge status="limited">{link.status}</Badge>
                      </div>

                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-accent2 transition-colors">
                          {link.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                          {link.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/30 text-xs font-semibold text-accent2 group-hover:text-warning transition-colors">
                      <span>Launch view</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-accent2 group-hover:text-warning" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Why Campus Navigator Section */}
      <section className="section-container">
        <div className="card-surface glass-panel rounded-3xl border border-border/50 p-8 sm:p-12 shadow-elevated grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <span className="eyebrow text-accent">Student-Centric Design</span>
            <h2 className="text-3xl font-display font-extrabold leading-tight text-foreground sm:text-4xl">
              Built specifically for modern campus workflows.
            </h2>
            <p className="text-sm leading-relaxed text-foreground-muted max-w-xl">
              Campus Navigator separates location search, live route navigation, dining crowd status, and student reviews into clean, distraction-free workflows.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/about" className="btn-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white">
                <span>Learn about our mission</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <Card icon={Compass} title="Dedicated Location Search" className="h-full">
              <p className="text-xs leading-relaxed text-foreground-muted mt-1">
                Fast room and building lookup with live keyword filtering and instant map pin highlighting.
              </p>
            </Card>
            <Card icon={Zap} title="Live Canteen Queue Updates" className="h-full">
              <p className="text-xs leading-relaxed text-foreground-muted mt-1">
                Real-time menu item availability indicators to save time during lunch hours.
              </p>
            </Card>
            <Card icon={Shield} title="Community Feedback Loop" className="h-full">
              <p className="text-xs leading-relaxed text-foreground-muted mt-1">
                Direct platform for students to rate campus services and report maintenance needs.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
