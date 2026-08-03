import { motion } from 'framer-motion';
import { Reveal, RevealItem, RevealStagger } from '../Reveal';
import RealLogo from '../RealLogo';

const FEATURES = [
  {
    logo: 'googlemaps',
    title: 'Real-time navigation',
    description: 'Live routes across every mapped building and floor.',
    color: 'rgb(var(--ui-accent))',
  },
  {
    logo: 'ubereats',
    title: 'Live canteen status',
    description: 'Menu availability and queue updates every two minutes.',
    color: 'rgb(var(--ui-accent))',
  },
  {
    logo: 'googlemessages',
    title: 'Verified feedback',
    description: 'Student-submitted ratings that facilities actually act on.',
    color: 'rgb(var(--ui-accent))',
  },
  {
    logo: 'googlecloud',
    title: 'Speed by default',
    description: 'Instant search results — no loading screens, no friction.',
    color: 'rgb(var(--ui-accent))',
  },
  {
    logo: 'googlecalendar',
    title: 'Always current',
    description: 'Campus data refreshed around the clock, not once a semester.',
    color: 'rgb(var(--ui-accent))',
  },
  {
    logo: 'googleworkspace',
    title: 'Trusted data',
    description: 'Every location verified against official campus records.',
    color: 'rgb(var(--ui-accent))',
  },
];

export default function FeatureGrid() {
  return (
    <section className="section-gap relative overflow-hidden">
      {/* Section glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'rgb(var(--ui-accent) / 0.35)' }}
      />

      <div className="section-container">
        <Reveal>
          <p className="eyebrow mb-6">Built for campus life</p>
          <h2 className="display-headline max-w-2xl">
            Everything you need.
            <br />
            <span className="text-gradient">Nothing you don&apos;t.</span>
          </h2>
        </Reveal>

        <RevealStagger
           className="feature-grid mt-14 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.08}
        >
          {FEATURES.map((feature) => {
            return (
              <RevealItem key={feature.title}>
                <motion.div
                  className="card-surface card-static feature-card group h-full"
                >
                  <div className="card-header">
                    <div className="card-header__main">
                      <span
                        className="card-header__icon"
                      style={{
                        background: feature.color,
                        color: '#ffffff',
                      }}
                        aria-hidden="true"
                      >
                        <RealLogo slug={feature.logo} color="ffffff" size={16} alt="" />
                      </span>
                      <h3 className="card-title">{feature.title}</h3>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="text-sm leading-relaxed text-foreground-muted">{feature.description}</p>
                    <div
                      className="feature-card__line h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-full"
                      style={{ background: feature.color }}
                    />
                  </div>
                </motion.div>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
