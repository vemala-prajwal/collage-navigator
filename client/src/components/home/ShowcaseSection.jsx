import { Link } from 'react-router-dom';
import { ArrowUpRight, Map, MapPin, UtensilsCrossed, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { Reveal, RevealItem, RevealStagger } from '../Reveal';

const SHOWCASE_ITEMS = [
  {
    title: 'Campus Map Search',
    description: 'Search any building, room, or facility with a live interactive map.',
    to: '/map-search',
    icon: Map,
  },
  {
    title: 'Canteen Live Menu',
    description: 'Real-time food availability, queue status, and daily specials.',
    to: '/canteen',
    icon: UtensilsCrossed,
  },
  {
    title: 'Location Feedback',
    description: 'Rate facilities, report issues, and track responses in one place.',
    to: '/map-search',
    icon: Star,
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
        <motion.article className="card-surface card-interactive showcase-card flex h-full flex-col">
          <div className="card-header">
            <div className="card-header__main">
              <span className="card-header__icon" aria-hidden="true">
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <h3 className="card-title">{title}</h3>
            </div>
            <ArrowUpRight size={20} className="text-foreground-muted" />
          </div>

          <div className="card-body flex-1">
            <p className="text-sm leading-relaxed text-foreground-muted">{subtitle}</p>

            <div className="showcase-preview relative h-32 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="showcase-preview__label card-label">
                Open preview
              </span>
            </div>
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
  }).isRequired,
  locationPreview: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    building: PropTypes.string,
    floor: PropTypes.number,
  }),
};

export default function ShowcaseSection({ locations = [] }) {
  const safeLocations = Array.isArray(locations) ? locations : [];
  const locationCards = safeLocations.slice(0, 3);

  return (
    <section className="section-gap relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'rgb(var(--ui-accent) / 0.35)' }}
      />
      <div className="section-container">
        <Reveal>
          <p className="eyebrow mb-6">Explore the platform</p>
          <h2 className="display-headline max-w-2xl">
            See it in
            <span className="text-gradient italic"> action.</span>
          </h2>
        </Reveal>

        <RevealStagger className="mt-14 grid items-stretch gap-4 lg:grid-cols-3" stagger={0.1}>
          {SHOWCASE_ITEMS.map((item, index) => (
            <ShowcaseCard
              key={item.title}
              item={item}
              locationPreview={index === 2 && locationCards[0] ? locationCards[0] : null}
            />
          ))}
        </RevealStagger>

        {safeLocations.length > 0 ? (
          <Reveal className="mt-14" delay={0.1}>
            <p className="eyebrow mb-8">Popular destinations</p>
            <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {safeLocations.slice(0, 6).map((location) => (
                <Link
                  key={location._id}
                  to={`/locations/${location._id}`}
                  className="group card-surface card-interactive popular-destination"
                >
                  <div className="card-header">
                    <div className="card-header__main">
                      <span className="card-header__icon" aria-hidden="true">
                        <MapPin size={16} strokeWidth={1.8} />
                      </span>
                      <span className="card-title">{location.name}</span>
                    </div>
                    <ArrowUpRight size={16} className="text-foreground-muted" />
                  </div>
                  <div className="card-data-item">
                    <span className="card-label">Building / floor</span>
                    <span className="card-value text-sm">{location.building} · Floor {location.floor}</span>
                  </div>
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
