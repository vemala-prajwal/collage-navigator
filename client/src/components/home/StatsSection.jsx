import PropTypes from 'prop-types';
import { Reveal, RevealItem, RevealStagger } from '../Reveal';
import { useCountUp } from '../../lib/useCountUp';

function StatItem({ value, suffix, prefix, label }) {
  const { ref, display } = useCountUp(value, { suffix, prefix, duration: 2 });

  return (
    <RevealItem>
      <div ref={ref} className="premium-card p-8 text-center md:text-left">
        <p className="display-stat text-gradient">{display}</p>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-foreground-muted">{label}</p>
      </div>
    </RevealItem>
  );
}

StatItem.propTypes = {
  value: PropTypes.number.isRequired,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
  label: PropTypes.string.isRequired,
};

export default function StatsSection({ locationCount = 50 }) {
  const stats = [
    { value: locationCount, suffix: '+', label: 'Locations mapped' },
    { value: 24, suffix: '/7', label: 'Live updates' },
    { value: 1000, suffix: '+', label: 'Students guided' },
  ];

  return (
    <section className="section-gap relative overflow-hidden border-t border-border/30">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent dark:from-accent/[0.02]" aria-hidden="true" />
      <div className="section-container relative">
        <Reveal className="mb-16">
          <h2 className="display-headline max-w-xl">
            Numbers that
            <span className="italic text-foreground-muted"> matter.</span>
          </h2>
        </Reveal>

        <RevealStagger className="grid gap-6 sm:grid-cols-3" stagger={0.1}>
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

StatsSection.propTypes = {
  locationCount: PropTypes.number,
};
