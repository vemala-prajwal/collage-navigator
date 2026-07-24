import { useEffect, useState } from 'react';
import api from '../services/api';

const statusStyles = {
  available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-400',
  limited: 'bg-amber-100 text-amber-700 dark:bg-amber-600/20 dark:text-amber-400',
  soldOut: 'bg-rose-100 text-rose-700 dark:bg-rose-600/20 dark:text-rose-400',
};

export default function CanteenPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get('/canteen-items');
        setItems(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return <div className="grid gap-4 md:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-800 dark:bg-slate-900/70" />)}</div>;
  }

  return (
    <div>
      <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Live canteen menu</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Fresh updates on availability and pricing for the day.</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item._id} className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs uppercase ${statusStyles[item.status]}`}>{item.status}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">₹{item.price}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
