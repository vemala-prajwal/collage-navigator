import { Link } from 'react-router-dom';
import { ArrowUpRight, Map, UtensilsCrossed, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { Reveal, RevealItem, RevealStagger } from '../Reveal';

const SHOWCASE_ITEMS = [
  {
    title: 'Campus Map Search',
    description: 'Search any building, room, or facility with a live interactive map.',
    to: '/map-search',
    icon: Map,
    gradient: 'from-accent/25 via-accent/5 to-transparent',
  },
  {
    title: 'Canteen Live Menu',
    description: 'Real-time food availability, queue status, and daily specials.',
    to: '/canteen',
    icon: UtensilsCrossed,
    gradient: 'from-accent/20 via-transparent to-transparent',
  },
  {
    title: 'Location Feedback',
    description: 'Rate facilities, report issues, and track responses in one place.',
    to: '/map-search',
    icon: Star,
    gradient: 'from-accent/15 via-transparent to-transparent',
  },
];

function ShowcaseCard({ item, locationPreview }) {
  const Icon = item.icon;
  const title = locationPreview?.name ? `${locationPreview.name}` : item.title;
  const subtitle = locationPreview
    ? `${locationPreview.building} · Floor ${locationPreview.floor}`
    : item.description;

  return (
    <RevealItem>
      <Link to={locationPreview ? `/locations/${locationPreview._id}` : item.to} className="group block h-full">
        <motion.article
          className="premium-card flex h-full flex-col p-8"
        >
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-40`} />

          <div className="relative flex items-start justify-between gap-4">
            <div className="icon-well">
              <Icon size={20} className="text-foreground-muted" strokeWidth={1.5} />
            </div>
            <ArrowUpRight
              size={20}
              className="text-foreground-muted"
            />
          </div>

          <h3 className="relative mt-8 font-display text-2xl font-bold text-foreground">{title}</h3>
          <p className="relative mt-3 flex-1 text-sm leading-relaxed text-foreground-muted">{subtitle}</p>

          <div className="relative mt-8 h-36 overflow-hidden rounded-xl border border-border/30 bg-background/40">
            <div className="hero-preview-grid h-full w-full opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full border border-border/50 bg-surface/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted backdrop-blur-sm">
                Open preview
              </span>
            </div>
          </div>
        </motion.article>
      </Link>
    </RevealItem>
  );
}

ShowcaseCard.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    gradient: PropTypes.string.isRequired,
  }).isRequired,
  locationPreview: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    building: PropTypes.string,
    floor: PropTypes.number,
  }),
};

export default function ShowcaseSection({ locations = [] }) {
  const locationCards = locations.slice(0, 3);

  return (
    <section className="section-gap relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--color-accent)/0.4), transparent)' }}
      />
      <div className="section-container">
        <Reveal>
          <p className="eyebrow mb-6">Explore the platform</p>
          <h2 className="display-headline max-w-2xl">
            See it in
            <span className="text-gradient italic"> action.</span>
          </h2>
        </Reveal>

        <RevealStagger className="mt-20 grid gap-6 lg:grid-cols-3" stagger={0.1}>
          {SHOWCASE_ITEMS.map((item, index) => (
            <ShowcaseCard
              key={item.title}
              item={item}
              locationPreview={index === 2 && locationCards[0] ? locationCards[0] : null}
            />
          ))}
        </RevealStagger>

        {locations.length > 0 ? (
          <Reveal className="mt-20" delay={0.1}>
            <p className="eyebrow mb-8">Popular destinations</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {locations.slice(0, 6).map((location) => (
                <Link
                  key={location._id}
                  to={`/locations/${location._id}`}
                  className="group premium-card flex items-center justify-between px-5 py-4"
                >
                  <div>
                    <p className="font-display font-bold text-foreground">{location.name}</p>
                    <p className="mt-1 text-xs text-foreground-muted">
                      {location.building} · Floor {location.floor}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-foreground-muted"
                  />
                </Link>
              ))}
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

ShowcaseSection.propTypes = {
  locations: PropTypes.arrayOf(PropTypes.object),
};
