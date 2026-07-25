import { motion } from 'framer-motion';
import { Reveal, RevealItem, RevealStagger } from '../Reveal';
import RealLogo from '../RealLogo';

const FEATURES = [
  {
    logo: 'googlemaps',
    title: 'Real-time navigation',
    description: 'Live routes across every mapped building and floor.',
    color: 'var(--gradient-accent)',
  },
  {
    logo: 'ubereats',
    title: 'Live canteen status',
    description: 'Menu availability and queue updates every two minutes.',
    color: 'linear-gradient(135deg, rgb(16 185 129), rgb(52 211 153))',
  },
  {
    logo: 'googlemessages',
    title: 'Verified feedback',
    description: 'Student-submitted ratings that facilities actually act on.',
    color: 'linear-gradient(135deg, rgb(245 158 11), rgb(251 191 36))',
  },
  {
    logo: 'googlecloud',
    title: 'Speed by default',
    description: 'Instant search results — no loading screens, no friction.',
    color: 'var(--gradient-accent)',
  },
  {
    logo: 'googlecalendar',
    title: 'Always current',
    description: 'Campus data refreshed around the clock, not once a semester.',
    color: 'linear-gradient(135deg, rgb(239 68 68), rgb(248 113 113))',
  },
  {
    logo: 'googleworkspace',
    title: 'Trusted data',
    description: 'Every location verified against official campus records.',
    color: 'linear-gradient(135deg, rgb(16 185 129), rgb(52 211 153))',
  },
];

export default function FeatureGrid() {
  return (
    <section className="section-gap relative overflow-hidden">
      {/* Section glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--color-accent)/0.4), rgb(var(--color-accent2)/0.3), transparent)' }}
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
          className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.08}
        >
          {FEATURES.map((feature) => {
            return (
              <RevealItem key={feature.title}>
                <motion.div
                  className="group premium-card p-7"
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Icon */}
                  <div
                    className="icon-well icon-glow group-hover:border-transparent"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgb(var(--color-border)/0.5)',
                    }}
                  >
                    <span
                      className="inline-flex items-center justify-center rounded-lg p-1.5 transition-all duration-300"
                      style={{
                        background: feature.color,
                        opacity: 1,
                      }}
                    >
                      <RealLogo slug={feature.logo} color="ffffff" size={18} alt={`${feature.title} logo`} />
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                    {feature.description}
                  </p>

                  {/* Bottom gradient line on hover */}
                  <div
                    className="mt-6 h-0.5 w-0 rounded-full transition-all duration-500 group-hover:w-full"
                    style={{ background: feature.color }}
                  />
                </motion.div>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
