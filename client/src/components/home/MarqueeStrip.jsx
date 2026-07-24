import PropTypes from 'prop-types';

const DEFAULT_ITEMS = [
  'Engineering Block',
  'Science Labs',
  'Central Library',
  'Admin Building',
  'Sports Complex',
  'Medical Center',
  'Hostel Block A',
  'Innovation Hub',
];

export default function MarqueeStrip({ items = DEFAULT_ITEMS, stats = null }) {
  const displayItems = items.length > 0 ? items : DEFAULT_ITEMS;
  const doubled = [...displayItems, ...displayItems];

  return (
    <section
      id="discover"
      className="relative overflow-hidden py-8"
      style={{
        background: 'rgb(var(--color-surface-secondary)/0.4)',
        borderTop:    '1px solid rgb(var(--color-border)/0.3)',
        borderBottom: '1px solid rgb(var(--color-border)/0.3)',
      }}
    >
      {/* Top gradient line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'var(--gradient-accent)' }}
        aria-hidden="true"
      />

      {stats ? (
        <p className="section-container mb-6 text-center text-xs font-semibold uppercase tracking-[0.24em] text-foreground-muted/80">
          Trusted across{' '}
          <span className="text-gradient font-bold">{stats.buildings}</span>{' '}
          buildings ·{' '}
          <span className="text-gradient font-bold">{stats.labs}</span>{' '}
          labs ·{' '}
          <span className="text-gradient font-bold">{stats.departments}</span>{' '}
          departments
        </p>
      ) : null}

      {/* Fade masks */}
      <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' }}>
        <div className="marquee-track">
          {doubled.map((item, index) => (
            <span key={`${item}-${index}`} className="marquee-item">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

MarqueeStrip.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string),
  stats: PropTypes.shape({
    buildings:   PropTypes.number,
    labs:        PropTypes.number,
    departments: PropTypes.number,
  }),
};
