import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import api from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import PageHeader from '../components/PageHeader';
import { SkeletonCard } from '../components/Skeleton';

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const pinVariants = {
  hover: { scale: 1.08 },
  tap: { scale: 0.94 },
};

const statusMap = {
  available: 'available',
  limited: 'limited',
  soldOut: 'soldOut',
};

export default function MapSearchPage() {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const response = await api.get('/locations', { params: { query } });
        setLocations(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchLocations, 240);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!query) return locations;
    return locations.filter((location) => location.name.toLowerCase().includes(query.toLowerCase()));
  }, [locations, query]);

  const pinLayout = [
    { left: '16%', top: '22%' },
    { left: '56%', top: '18%' },
    { left: '72%', top: '52%' },
    { left: '30%', top: '64%' },
    { left: '84%', top: '74%' },
  ];

  const searchPanel = (
    <div className="premium-card p-4">
      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/60 px-4 py-3.5 backdrop-blur-sm">
        <Search className="text-accent/70" size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search locations, dining, or buildings"
          className="w-full bg-transparent text-foreground outline-none placeholder:text-foreground-muted/50"
        />
      </div>
      <p className="mt-3 text-sm text-foreground-muted">
        {loading ? 'Searching campus data…' : `${results.length} locations found`}
      </p>
    </div>
  );

  return (
    <div>
      <PageHeader
        eyebrow="Map search"
        title="Search campus locations with a live map and instant results."
        description="Browse every building, classroom, and dining point on the campus map while results update in real time."
      >
        {searchPanel}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <SkeletonCard key={item} />
              ))}
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={listVariants} className="space-y-4">
              {results.map((location) => {
                const status = statusMap[location.status] || 'available';
                const isSelected = selectedId === location._id;

                return (
                  <motion.div key={location._id} variants={itemVariants}>
                    <Link to={`/locations/${location._id}`}>
                      <Card
                        className={`cursor-pointer ${isSelected ? 'border-accent/40 ring-2 ring-accent/15' : ''}`}
                        onMouseEnter={() => setSelectedId(location._id)}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="max-w-xl">
                            <p className="eyebrow text-[0.65rem]">{location.type || 'Campus point'}</p>
                            <h2 className="mt-2 font-display text-2xl font-bold text-foreground">{location.name}</h2>
                            <p className="mt-2 text-sm text-foreground-muted">
                              {location.building} • Floor {location.floor}
                            </p>
                          </div>
                          <Badge status={status}>
                            {status === 'available' ? 'Open now' : status === 'limited' ? 'Limited' : 'Closed'}
                          </Badge>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2 text-xs text-foreground-muted">
                          <span className="rounded-full border border-border bg-surface-secondary px-3 py-1">
                            ID {location._id.slice(-4)}
                          </span>
                          <span className="rounded-full border border-border bg-surface-secondary px-3 py-1">
                            {location.building}
                          </span>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>

        <section className="glass-panel relative overflow-hidden rounded-2xl p-6">
          <div className="relative h-[520px] overflow-hidden rounded-xl border border-border/40 bg-surface-secondary">
            {loading ? (
              <div className="absolute inset-0 shimmer" />
            ) : (
              <div className="relative h-full">
                <div className="hero-preview-grid absolute inset-0 opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />
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
                      className={`absolute grid h-14 w-14 place-items-center rounded-full border border-border/50 bg-surface/90 text-foreground shadow-card backdrop-blur-sm transition-all duration-300 dark:shadow-none dark:bg-surface/80 ${
                        isActive ? 'border-accent/50 ring-4 ring-accent/20 dark:shadow-glow' : ''
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

          <div className="relative mt-6 premium-card p-5 text-sm">
            <p className="eyebrow mb-3 text-[0.65rem]">Selected location</p>
            {selectedId ? (
              <div className="space-y-2">
                <p className="text-base font-semibold text-foreground">
                  {results.find((location) => location._id === selectedId)?.name || 'Campus location'}
                </p>
                <p className="text-sm text-foreground-muted">
                  Open the location page to leave feedback and see full details.
                </p>
                <Link to={`/locations/${selectedId}`} className="inline-block text-sm font-semibold text-accent hover:underline">
                  View details →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">Tap a pin to highlight a location on the map.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
