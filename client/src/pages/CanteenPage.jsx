import { useEffect, useState } from 'react';
import api from '../services/api';

const statusStyles = {
  available: 'bg-emerald-600/20 text-emerald-400',
  limited: 'bg-amber-600/20 text-amber-400',
  soldOut: 'bg-rose-600/20 text-rose-400',
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
    return <div className="grid gap-4 md:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-800" />)}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Live canteen menu</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item._id} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{item.category}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs uppercase ${statusStyles[item.status]}`}>{item.status}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-lg font-semibold">₹{item.price}</p>
              <p className="text-xs text-slate-500">Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
