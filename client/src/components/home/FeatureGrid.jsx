import { MapPin, UtensilsCrossed, MessageSquare, Zap, Clock, ShieldCheck } from 'lucide-react';
import { Reveal, RevealItem, RevealStagger } from '../Reveal';

const FEATURES = [
  {
    icon: MapPin,
    title: 'Real-time navigation',
    description: 'Live routes across every mapped building and floor.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Live canteen status',
    description: 'Menu availability and queue updates every two minutes.',
  },
  {
    icon: MessageSquare,
    title: 'Verified feedback',
    description: 'Student-submitted ratings that facilities actually act on.',
  },
  {
    icon: Zap,
    title: 'Speed by default',
    description: 'Instant search results — no loading screens, no friction.',
  },
  {
    icon: Clock,
    title: 'Always current',
    description: 'Campus data refreshed around the clock, not once a semester.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted data',
    description: 'Every location verified against official campus records.',
  },
];

export default function FeatureGrid() {
  return (
    <section className="section-gap border-t border-border/30">
      <div className="section-container">
        <Reveal>
          <p className="eyebrow mb-6">Built for campus life</p>
          <h2 className="display-headline max-w-2xl">
            Everything you need.
            <br />
            <span className="text-foreground-muted">Nothing you don&apos;t.</span>
          </h2>
        </Reveal>

        <RevealStagger className="mt-20 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <RevealItem key={feature.title}>
                <div className="group premium-card p-7">
                  <div className="icon-well group-hover:border-accent/30 group-hover:bg-accent/10">
                    <Icon
                      size={20}
                      strokeWidth={1.5}
                      className="text-foreground-muted transition-colors duration-300 group-hover:text-accent"
                    />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-muted">{feature.description}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
