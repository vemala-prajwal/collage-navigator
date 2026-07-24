import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Reveal, RevealItem, RevealStagger } from '../Reveal';
import { useCountUp } from '../../lib/useCountUp';

function StatItem({ value, suffix, prefix, label }) {
  const { ref, display } = useCountUp(value, { suffix, prefix, duration: 2 });

  return (
    <RevealItem>
      <motion.div
        ref={ref}
        className="stat-card-glow premium-card p-8 text-center"
        whileHover={{ y: -6 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="display-stat text-gradient">{display}</p>
        <div className="mx-auto mt-4 h-0.5 w-12 rounded-full" style={{ background: 'var(--gradient-accent)' }} />
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-foreground-muted">
          {label}
        </p>
      </motion.div>
    </RevealItem>
  );
}

StatItem.propTypes = {
  value:  PropTypes.number.isRequired,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
  label:  PropTypes.string.isRequired,
};

export default function StatsSection({ locationCount = 50 }) {
  const stats = [
    { value: locationCount, suffix: '+', label: 'Locations mapped' },
    { value: 24,            suffix: '/7', label: 'Live updates' },
    { value: 1000,          suffix: '+', label: 'Students guided' },
  ];

  return (
    <section className="section-gap relative overflow-hidden">
      {/* Gradient glow band */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-80 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center, rgb(var(--color-accent)/0.25) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--color-accent)/0.4), transparent)' }}
      />

      <div className="section-container relative">
        <Reveal className="mb-16">
          <p className="eyebrow mb-6">By the numbers</p>
          <h2 className="display-headline max-w-xl">
            Numbers that
            <span className="text-gradient italic"> matter.</span>
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
