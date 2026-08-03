import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { Reveal, RevealItem, RevealStagger } from '../Reveal';
import { useCountUp } from '../../lib/useCountUp';

function StatItem({ value, suffix, prefix, label }) {
  const { ref, display } = useCountUp(value, { suffix, prefix, duration: 2 });

  return (
    <RevealItem>
      <motion.div
        ref={ref}
        className="card-surface card-static stat-card-glow text-center"
      >
        <div className="card-header justify-center">
          <div className="card-header__main">
            <span className="card-header__icon" aria-hidden="true">
              <Activity size={16} strokeWidth={1.8} />
            </span>
            <span className="card-title">{label}</span>
          </div>
        </div>
        <div className="card-data-item items-center">
          <p className="display-stat text-gradient">{display}</p>
          <span className="card-label">Current total</span>
        </div>
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
        style={{ background: 'rgb(var(--ui-accent) / 0.35)' }}
      />

      <div className="section-container relative">
          <Reveal className="mb-12">
          <p className="eyebrow mb-6">By the numbers</p>
          <h2 className="display-headline max-w-xl">
            Numbers that
            <span className="text-gradient italic"> matter.</span>
          </h2>
        </Reveal>

        <RevealStagger className="grid gap-4 sm:grid-cols-3" stagger={0.1}>
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
