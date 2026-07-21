import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
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
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-sky-400">Campus navigation</p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Find classrooms, facilities, and food in seconds.</h1>
            <p className="mt-4 max-w-2xl text-slate-300">A modern campus guide for students and faculty with real-time canteen updates and feedback.</p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 p-3">
              <Search className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for a room or building"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>
          <div className="grid gap-3">
            <Link to="/locations/1" className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex items-center gap-3"><MapPinned size={20} className="text-sky-400" /><span>Find a Room</span></div>
            </Link>
            <Link to="/canteen" className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex items-center gap-3"><UtensilsCrossed size={20} className="text-emerald-400" /><span>Canteen</span></div>
            </Link>
            <Link to="/feedback" className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex items-center gap-3"><MessageSquareText size={20} className="text-amber-400" /><span>Feedback</span></div>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Popular locations</h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-800" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {locations.map((location) => (
              <Link key={location._id} to={`/locations/${location._id}`} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{location.name}</h3>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase">{location.type}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{location.building} • Floor {location.floor}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
