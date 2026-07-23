import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

const statusLabel = {
  available: 'Available',
  limited: 'Limited',
  soldOut: 'Sold out',
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-2xl">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-primary-200">Canteen menu</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl">Fresh campus food, status-first.</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">Scan the live menu, see availability instantly, and spot the fastest line with confidence.</p>
        </div>
      </section>

      <motion.section
        initial="hidden"
        animate={loading ? 'hidden' : 'visible'}
        variants={listVariants}
        className="grid gap-6 md:grid-cols-2"
      >
        {loading
          ? [1, 2, 3, 4].map((item) => (
              <Card key={item} className="overflow-hidden bg-slate-900/80">
                <div className="space-y-5">
                  <div className="h-5 w-2/5 rounded-full bg-slate-800 shimmer" />
                  <div className="h-4 w-1/4 rounded-full bg-slate-800 shimmer" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="h-12 rounded-3xl bg-slate-800 shimmer" />
                    <div className="h-12 rounded-3xl bg-slate-800 shimmer" />
                  </div>
                </div>
              </Card>
            ))
          : items.map((item) => (
              <motion.div key={item._id} variants={itemVariants}>
                <Card className="group overflow-hidden">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold text-white">{item.name}</h2>
                        <p className="mt-2 text-sm text-slate-400">{item.category}</p>
                      </div>
                      <Badge status={item.status}>{statusLabel[item.status] || 'Available'}</Badge>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">₹{item.price}</p>
                        <p className="mt-1 text-sm text-slate-500">Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="rounded-3xl bg-white/5 px-4 py-2 text-sm text-slate-300">Chef’s pick</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
      </motion.section>
    </main>
  );
}
