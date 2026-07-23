import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import api from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-10 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary-200">Map search</p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">Search campus locations with a live map and instant results.</h1>
            <p className="mt-4 text-base leading-7 text-slate-300">Browse every building, classroom, and dining point on the campus map while results update in real time.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/85 p-4 shadow-soft">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-950/90 px-4 py-3">
              <Search className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search locations, dining, or buildings"
                className="w-full bg-transparent text-white placeholder:text-slate-500 outline-none"
              />
            </div>
            <p className="mt-3 text-sm text-slate-400">{loading ? 'Searching campus data...' : `${results.length} locations found`}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75 p-6"
                >
                  <div className="space-y-4">
                    <div className="h-5 w-2/5 rounded-full bg-slate-800 shimmer" />
                    <div className="h-4 w-3/4 rounded-full bg-slate-800 shimmer" />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="h-10 rounded-2xl bg-slate-800 shimmer" />
                      <div className="h-10 rounded-2xl bg-slate-800 shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={listVariants} className="space-y-4">
              {results.map((location, index) => {
                const status = statusMap[location.status] || 'available';
                const isSelected = selectedId === location._id;

                return (
                  <motion.div key={location._id} variants={itemVariants}>
                    <Card className={`group transition duration-300 ${isSelected ? 'border-primary-500/30' : ''}`}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-xl">
                          <p className="text-xs uppercase tracking-[0.3em] text-primary-200">{location.type || 'Campus point'}</p>
                          <h2 className="mt-3 text-2xl font-semibold text-white">{location.name}</h2>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{location.building} • Floor {location.floor}</p>
                        </div>
                        <Badge status={status}>{status === 'available' ? 'Open now' : status === 'limited' ? 'Limited' : 'Closed'}</Badge>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span className="rounded-full bg-white/5 px-3 py-1">ID {location._id.slice(-4)}</span>
                        <span className="rounded-full bg-white/5 px-3 py-1">{location.building}</span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-soft">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.12),_transparent_30%)]" />
          <div className="relative h-[560px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/80">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.04),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.45),_transparent_35%)]" />

            {loading ? (
              <div className="absolute inset-0 shimmer" />
            ) : (
              <div className="relative h-full">
                {pinLayout.slice(0, Math.min(results.length, pinLayout.length)).map((position, index) => {
                  const location = results[index] || results[0];
                  const isActive = selectedId === location?._id;

                  return (
                    <motion.button
                      key={position.left}
                      type="button"
                      onClick={() => setSelectedId(location?._id)}
                      whileHover="hover"
                      whileTap="tap"
                      variants={pinVariants}
                      className={`absolute grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-slate-950/90 text-white transition-all duration-300 ${
                        isActive ? 'shadow-[0_0_0_12px_rgba(34,197,94,0.15)]' : 'shadow-lg'
                      }`}
                      style={position}
                    >
                      <MapPin className="h-6 w-6 text-primary-300" />
                      <motion.span
                        animate={isActive ? { scale: [0.9, 1.2, 1], opacity: [0.7, 0.2, 0] } : { opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 rounded-full border border-primary-300/50"
                      />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative mt-6 rounded-3xl border border-white/10 bg-slate-900/85 p-5 text-sm text-slate-300">
            <p className="mb-3 uppercase tracking-[0.3em] text-primary-200">Selected location</p>
            {selectedId ? (
              <div className="space-y-2">
                <p className="text-base font-semibold text-white">
                  {results.find((location) => location._id === selectedId)?.name || 'Campus location'}
                </p>
                <p className="text-sm text-slate-400">Tap a pin to reveal details and center the result.</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Hover over a pin and click to explore a location.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
