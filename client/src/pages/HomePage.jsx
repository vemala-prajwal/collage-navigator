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
      <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-300">Campus navigation</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">Find classrooms, facilities, and food in seconds.</h1>
            <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">A modern campus guide for students and faculty with real-time canteen updates and feedback.</p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-950/70">
              <Search className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for a room or building"
                className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="grid gap-3">
            <Link to="/locations/1" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80">
              <div className="flex items-center gap-3"><MapPinned size={20} className="text-sky-500" /><span className="font-medium text-slate-800 dark:text-slate-100">Find a Room</span></div>
            </Link>
            <Link to="/canteen" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80">
              <div className="flex items-center gap-3"><UtensilsCrossed size={20} className="text-emerald-500" /><span className="font-medium text-slate-800 dark:text-slate-100">Canteen</span></div>
            </Link>
            <Link to="/feedback" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80">
              <div className="flex items-center gap-3"><MessageSquareText size={20} className="text-amber-500" /><span className="font-medium text-slate-800 dark:text-slate-100">Feedback</span></div>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Popular locations</h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-800 dark:bg-slate-900/70" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {locations.map((location) => (
              <Link key={location._id} to={`/locations/${location._id}`} className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{location.name}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">{location.type}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{location.building} • Floor {location.floor}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
