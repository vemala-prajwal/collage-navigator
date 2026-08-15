import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, X } from 'lucide-react';
import api from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import PageHeader from '../components/PageHeader';
import { SkeletonCard } from '../components/Skeleton';
import usePageMeta from '../hooks/usePageMeta';

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};

const pinVariants = {
  hover: { scale: 1.03 },
  tap: { scale: 0.98 },
};

const statusMap = {
  available: 'available',
  limited: 'limited',
  soldOut: 'soldOut',
};

export default function MapSearchPage() {
  usePageMeta({
    title: 'Search & Navigate',
    description: 'Search campus locations and follow live routes with a modern navigation experience built for students.',
  });

  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const response = await api.get('/locations', { params: { query } });
        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.locations)
          ? data.locations
          : [];
        setLocations(list);
      } catch (error) {
        console.error(error);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchLocations, 240);
    const subscription = api.subscribe('locations', () => {
      fetchLocations();
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [query]);

  const results = useMemo(() => {
    const safeLocations = Array.isArray(locations) ? locations : [];
    if (!query) return safeLocations;
    return safeLocations.filter(
      (location) =>
        location?.name?.toLowerCase().includes(query.toLowerCase()) ||
        location?.building?.toLowerCase().includes(query.toLowerCase())
    );
  }, [locations, query]);

  const pinLayout = [
    { left: '16%', top: '22%' },
    { left: '56%', top: '18%' },
    { left: '72%', top: '52%' },
    { left: '30%', top: '64%' },
    { left: '84%', top: '74%' },
  ];

  const searchPanel = (
    <div className="card-surface premium-card card-static search-panel">
      <div className="card-header">
        <div className="card-header__main">
          <span className="card-header__icon" aria-hidden="true">
            <Search size={16} strokeWidth={1.8} />
          </span>
          <span className="card-title">Search campus locations</span>
        </div>
      </div>
      <div className="card-body">
        <div className="search-field relative flex items-center gap-3 rounded-lg border border-border/50 bg-surface-secondary px-4 py-3">
          <Search className="text-accent/70" size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search locations, dining, or buildings"
            aria-label="Search campus locations"
            className="w-full bg-transparent pr-8 text-sm text-foreground outline-none placeholder:text-foreground-muted/50"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 inline-flex rounded-md p-1 text-foreground-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>
        <p className="card-label">
          {loading ? 'Searching campus data…' : `${results.length} locations found`}
        </p>
      </div>
    </div>
  );

  return (
    <div className="map-page">
      <PageHeader
        icon={MapPin}
        eyebrow="Map search"
        title="Search campus locations with a live map and instant results."
        description="Browse every building, classroom, and dining point on the campus map while results update in real time."
      >
        {searchPanel}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <SkeletonCard key={item} />
              ))}
            </div>
          ) : (
              <motion.div initial="hidden" animate="visible" variants={listVariants} className="space-y-3">
              {results.length === 0 ? (
                <div className="card-surface flat-card empty-state">
                  <div className="card-header">
                    <div className="card-header__main">
                      <span className="card-header__icon" aria-hidden="true">
                        <Search size={16} strokeWidth={1.8} />
                      </span>
                      <h2 className="card-title">No locations found</h2>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="max-w-sm text-sm leading-relaxed text-foreground-muted">
                      Try a building name, room number, or facility type.
                    </p>
                  </div>
                </div>
              ) : null}
              {results.map((location, index) => {
                const status = statusMap[location?.status] || 'available';
                const isSelected = selectedId === location?._id;

                return (
                  <motion.div
                    key={location?._id || `${location?.name || 'location'}-${index}`}
                    variants={itemVariants}
                  >
                    <Link to={`/locations/${location?._id}`}>
                      <Card
                        icon={MapPin}
                        title={location?.name || 'Campus location'}
                        status={
                          <Badge status={status}>
                            {status === 'available' ? 'Open now' : status === 'limited' ? 'Limited' : 'Closed'}
                          </Badge>
                        }
                        className={`cursor-pointer location-result ${isSelected ? 'card-selected' : ''}`}
                        onMouseEnter={() => setSelectedId(location?._id)}
                      >
                        <div className="flex flex-col gap-3">
                          <span className="card-label">{location?.type || 'Campus point'}</span>
                          <div className="card-data-grid card-data-grid--two">
                            <div className="card-data-item">
                              <span className="card-label">Building</span>
                              <span className="card-value text-base">{location?.building || 'Unassigned'}</span>
                            </div>
                            <div className="card-data-item">
                              <span className="card-label">Floor</span>
                              <span className="card-value">{location?.floor ?? '—'}</span>
                            </div>
                          </div>
                          <div className="card-meta-row">
                            <span className="card-label">Record</span>
                            <span>{location?._id?.slice(-4) || '----'}</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>

        <section className="card-surface glass-panel map-shell relative">
          <div className="card-header">
            <div className="card-header__main">
              <span className="card-header__icon" aria-hidden="true">
                <MapPin size={16} strokeWidth={1.8} />
              </span>
              <div>
                <p className="eyebrow">Live map</p>
                <p className="card-title">Campus points in view</p>
              </div>
            </div>
            <Badge status="available">Live</Badge>
          </div>
          <div className="card-body">
            <div className="map-stage relative h-[440px] sm:h-[520px]">
              {loading ? (
                <div className="absolute inset-0 shimmer" />
              ) : (
                <div className="relative h-full">
                  {pinLayout.slice(0, Math.min(results.length, pinLayout.length)).map((position, index) => {
                    const location = results[index] || results[0];
                    const isActive = selectedId === location?._id;

                    return (
                      <motion.button
                        key={`${position.left}-${position.top}`}
                        type="button"
                        onClick={() => setSelectedId(location?._id)}
                        whileHover="hover"
                        whileTap="tap"
                        variants={pinVariants}
                        aria-label={`Select ${location?.name || 'location'}`}
                        aria-pressed={isActive}
                        className={`map-pin absolute grid h-12 w-12 place-items-center rounded-full border border-border/50 bg-surface text-foreground transition-all duration-300 sm:h-14 sm:w-14 ${
                          isActive ? 'is-active border-accent/50 ring-4 ring-accent/20' : ''
                        }`}
                        style={position}
                      >
                        <MapPin className="h-6 w-6 text-accent" />
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card-surface premium-card card-static selected-location text-sm">
              <div className="card-header">
                <div className="card-header__main">
                  <span className="card-header__icon" aria-hidden="true">
                    <MapPin size={16} strokeWidth={1.8} />
                  </span>
                  <span className="card-title">Selected location</span>
                </div>
              </div>
              {selectedId ? (
                <div className="card-body">
                  <div className="card-data-item">
                    <span className="card-label">Destination</span>
                    <span className="card-value text-base">
                      {results.find((location) => location?._id === selectedId)?.name || 'Campus location'}
                    </span>
                  </div>
                  <p className="text-sm text-foreground-muted">
                    Open the location page to leave feedback and see full details.
                  </p>
                  <Link to={`/locations/${selectedId}`} className="text-sm font-semibold text-accent hover:underline">
                    View details →
                  </Link>
                </div>
              ) : (
                <div className="card-body">
                  <p className="text-sm text-foreground-muted">Tap a pin to highlight a location on the map.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
