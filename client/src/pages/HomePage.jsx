import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Hero from '../components/Hero';
import { Search, MapPinned, UtensilsCrossed, MessageSquareText } from 'lucide-react';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('/locations', { params: { query } });
        setLocations(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [query]);

  return (
    <div className="space-y-16">
      <Hero />

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-semibold text-white">Popular locations</h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {locations.map((location) => (
              <Link
                key={location._id}
                to={`/locations/${location._id}`}
                className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{location.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{location.building} • Floor {location.floor}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{location.type}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
