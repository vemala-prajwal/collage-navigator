import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MapPin, X, ArrowRight, Compass, Navigation2 } from 'lucide-react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { SkeletonCard } from '../components/Skeleton';
import { fadeUp, staggerContainer } from '../lib/motion';
import usePageMeta from '../hooks/usePageMeta';

const statusMap = {
  available: 'available',
  limited: 'limited',
  soldOut: 'soldOut',
};

export default function NavigatePage() {
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
        if (list.length > 0 && !selectedId) {
          setSelectedId(list[0]._id);
        }
      } catch (error) {
        console.error(error);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchLocations, 200);
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

  const selectedLocation = useMemo(() => {
    return results.find((loc) => loc._id === selectedId) || results[0] || null;
  }, [results, selectedId]);

  const pinLayout = [
    { left: '20%', top: '25%' },
    { left: '60%', top: '20%' },
    { left: '75%', top: '55%' },
    { left: '32%', top: '68%' },
    { left: '82%', top: '78%' },
  ];

  return (
    <div className="navigate-page space-y-10">
      <PageHeader
        icon={Navigation2}
        eyebrow="Search & Navigate"
        title="Find any building, room, or service instantly."
        description="Type a destination keyword, select a result to inspect its route details, and follow turn-by-turn guidance across campus."
      >
        {/* Search Panel Card */}
        <div className="card-surface glass-panel rounded-2xl border border-border/50 p-4 sm:p-6 shadow-elevated">
          <label htmlFor="navigate-search" className="sr-only">Search campus locations</label>
          <div className="search-field relative flex items-center gap-3 rounded-xl border border-accent/30 bg-surface-secondary/80 px-4 py-3 shadow-inner">
            <Search className="text-accent shrink-0" size={20} />
            <input
              id="navigate-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search buildings, lab rooms, or facilities…"
              className="w-full bg-transparent pr-8 text-sm text-foreground outline-none placeholder:text-foreground-muted/60"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 inline-flex rounded-lg p-1.5 text-foreground-muted hover:bg-surface-elevated hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-foreground-muted font-medium px-1">
            <span>{loading ? 'Fetching campus data…' : `${results.length} locations available`}</span>
            <span className="text-accent flex items-center gap-1">
              <Compass size={13} /> Live indexing
            </span>
          </div>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Results Column */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <MapPin size={18} className="text-accent" />
              <span>Campus Locations</span>
            </h2>
            <span className="text-xs text-foreground-muted">Hover or tap card to preview</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <SkeletonCard key={item} />
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer(0.08, 0.04)}
              className="space-y-3"
            >
              {results.length === 0 ? (
                <Card title="No locations found" className="empty-state text-center py-8" hover={false}>
                  <p className="text-sm text-foreground-muted max-w-sm mx-auto">
                    No building or room matched "{query}". Try searching for terms like "Library", "Canteen", or "Auditorium".
                  </p>
                </Card>
              ) : null}

              {results.map((location, index) => {
                const status = statusMap[location?.status] || 'available';
                const isSelected = selectedId === location?._id;

                return (
                  <motion.div key={location?._id || `${location?.name}-${index}`} variants={fadeUp}>
                    <div
                      onMouseEnter={() => setSelectedId(location?._id)}
                      onClick={() => setSelectedId(location?._id)}
                      className={`card-surface rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'border-accent/60 bg-surface-secondary/90 shadow-glow'
                          : 'border-border/40 hover:border-border/80 hover:bg-surface-secondary/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isSelected ? 'bg-accent text-white shadow-glow' : 'bg-surface-elevated text-accent border border-border/40'}`}>
                            <MapPin size={18} />
                          </span>
                          <div>
                            <h3 className="font-display font-bold text-foreground text-base">
                              {location?.name || 'Campus Point'}
                            </h3>
                            <p className="text-xs text-foreground-muted mt-0.5">
                              {location?.type || 'Campus Facility'}
                            </p>
                          </div>
                        </div>
                        <Badge status={status}>
                          {status === 'available' ? 'Open now' : status === 'limited' ? 'Limited' : 'Closed'}
                        </Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-border/30 text-xs">
                        <div>
                          <span className="text-foreground-muted block">Building:</span>
                          <span className="font-semibold text-foreground">{location?.building || 'Main Campus'}</span>
                        </div>
                        <div>
                          <span className="text-foreground-muted block">Floor:</span>
                          <span className="font-semibold text-foreground">{location?.floor ?? 'Ground'}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Link
                          to={`/locations/${location?._id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent2 transition-colors"
                        >
                          <span>Full details</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>

        {/* Map & Preview Column */}
        <section className="space-y-6">
          <div className="card-surface glass-panel rounded-3xl border border-border/50 p-6 shadow-elevated">
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="font-display text-sm font-bold text-foreground">Interactive Campus View</span>
              </div>
              <Badge status="available">Live Grid</Badge>
            </div>

            {/* Visual Pin Map Stage */}
            <div className="relative h-[340px] sm:h-[400px] rounded-2xl bg-gradient-to-br from-surface-secondary via-background to-surface-elevated border border-border/40 overflow-hidden">
              <div className="absolute inset-0 bg-hero-mesh opacity-25 pointer-events-none" />

              {loading ? (
                <div className="absolute inset-0 shimmer" />
              ) : (
                <div className="relative h-full w-full">
                  {pinLayout.slice(0, Math.min(results.length, pinLayout.length)).map((position, index) => {
                    const location = results[index] || results[0];
                    const isActive = selectedId === location?._id;

                    return (
                      <motion.button
                        key={`${position.left}-${position.top}`}
                        type="button"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedId(location?._id)}
                        aria-label={`Select ${location?.name || 'location'}`}
                        className={`absolute flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 ${
                          isActive
                            ? 'bg-accent text-white border-accent2 shadow-glow ring-4 ring-accent/30 z-20'
                            : 'bg-surface-elevated/90 text-foreground-muted border-border/60 hover:text-accent hover:border-accent/40 z-10'
                        }`}
                        style={position}
                      >
                        <MapPin size={20} />
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Location Route Preview Card */}
            <div className="mt-5">
              <AnimatePresence mode="wait">
                {selectedLocation ? (
                  <motion.div
                    key={selectedLocation._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl bg-surface-secondary/70 border border-accent/30 p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-accent">Active Selection</span>
                      <Link
                        to={`/locations/${selectedLocation._id}`}
                        className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                      >
                        Navigate here <ArrowRight size={12} />
                      </Link>
                    </div>

                    <h4 className="font-display text-lg font-bold text-foreground">
                      {selectedLocation.name}
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="rounded-xl bg-surface p-2.5 border border-border/30">
                        <span className="text-foreground-muted block">Building:</span>
                        <span className="font-semibold text-foreground">{selectedLocation.building || 'Main Campus'}</span>
                      </div>
                      <div className="rounded-xl bg-surface p-2.5 border border-border/30">
                        <span className="text-foreground-muted block">Estimated Walk:</span>
                        <span className="font-semibold text-foreground">2–4 mins</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="rounded-2xl bg-surface-secondary/40 border border-border/40 p-5 text-center text-xs text-foreground-muted">
                    Hover or click a location card to display route info.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
