import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MapPin, X } from 'lucide-react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { SkeletonCard } from '../components/Skeleton';
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

  const pinLayout = [
    { left: '16%', top: '22%' },
    { left: '56%', top: '18%' },
    { left: '72%', top: '52%' },
    { left: '30%', top: '64%' },
    { left: '84%', top: '74%' },
  ];

  return (
    <div className="navigate-page space-y-8">
      <PageHeader
        icon={MapPin}
        eyebrow="Search & Navigate"
        title="Find your destination and follow the campus route with confidence."
        description="Search buildings, classrooms, and services instantly, then select any result to view its route and details."
      >
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
            <label htmlFor="navigate-search" className="sr-only">Search campus locations</label>
            <div className="search-field relative flex items-center gap-3 rounded-xl border border-border/50 bg-surface-secondary px-4 py-3">
              <Search className="text-accent/70" size={18} />
              <input
                id="navigate-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search locations, dining, or buildings"
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
            <p className="card-label mt-3">
              {loading ? 'Searching campus data…' : `${results.length} locations found`}
            </p>
          </div>
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <SkeletonCard key={item} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {results.length === 0 ? (
                <Card title="No locations found" className="empty-state" hover={false}>
                  <p className="text-sm leading-relaxed text-foreground-muted">
                    Try a room number, building name, or facility type.
                  </p>
                </Card>
              ) : null}

              {results.map((location, index) => {
                const status = statusMap[location?.status] || 'available';
                const isSelected = selectedId === location?._id;

                return (
                  <Link key={location?._id || `${location?.name}-${index}`} to={`/locations/${location?._id}`}>
                    <Card
                      icon={MapPin}
                      title={location?.name || 'Campus location'}
                      status={<Badge status={status}>{status === 'available' ? 'Open now' : status === 'limited' ? 'Limited' : 'Closed'}</Badge>}
                      className={`cursor-pointer ${isSelected ? 'card-selected' : ''}`}
                      hover={false}
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
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
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
                      <button
                        key={`${position.left}-${position.top}`}
                        type="button"
                        onClick={() => setSelectedId(location?._id)}
                        aria-label={`Select ${location?.name || 'location'}`}
                        aria-pressed={isActive}
                        className={`map-pin absolute grid h-12 w-12 place-items-center rounded-full border border-border/50 bg-surface text-foreground transition-all duration-300 sm:h-14 sm:w-14 ${
                          isActive ? 'is-active border-accent/50 ring-4 ring-accent/20' : ''
                        }`}
                        style={position}
                      >
                        <MapPin className="h-6 w-6 text-accent" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Card variant="glass" hover={false} icon={MapPin} title="Selected route preview">
              <p className="text-sm leading-relaxed text-foreground-muted">
                Select a location card to see its detailed routing and related navigation tips.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="card-data-item">
                  <span className="card-label">Smoothing</span>
                  <span className="card-value text-base">Live campus orientation</span>
                </div>
                <div className="card-data-item">
                  <span className="card-label">Hint</span>
                  <span className="card-value">Check building names before you walk.</span>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
