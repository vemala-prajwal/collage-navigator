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
    <section className="relative border-y border-border/30 bg-surface-secondary/20 py-8">
      {stats ? (
        <p className="section-container mb-6 text-center text-xs font-semibold uppercase tracking-[0.24em] text-foreground-muted/80">
          Trusted across{' '}
          <span className="text-accent">{stats.buildings}</span> buildings ·{' '}
          <span className="text-accent">{stats.labs}</span> labs ·{' '}
          <span className="text-accent">{stats.departments}</span> departments
        </p>
      ) : null}
      <div className="overflow-hidden">
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
    buildings: PropTypes.number,
    labs: PropTypes.number,
    departments: PropTypes.number,
  }),
};
