import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setItems(list);
      } catch (error) {
        console.error(error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
    const subscription = api.subscribe('canteen_items', () => {
      fetchItems();
    });

    return () => subscription.unsubscribe();
  }, []);

  const safeItems = Array.isArray(items) ? items : [];
  const statusCounts = safeItems.reduce(
    (counts, item) => {
      const status = item?.status || 'available';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    },
    { available: 0, limited: 0, soldOut: 0 },
  );

  return (
    <div>
      <PageHeader
        eyebrow="Canteen menu"
        title="Fresh campus food, status-first."
        description="Scan the live menu, see availability instantly, and spot the fastest line with confidence."
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Available', value: statusCounts.available, tone: 'text-success' },
          { label: 'Limited', value: statusCounts.limited, tone: 'text-warning' },
          { label: 'Sold out', value: statusCounts.soldOut, tone: 'text-error' },
        ].map((stat) => (
          <div key={stat.label} className="flat-card p-4 sm:p-5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
              {stat.label}
            </p>
            <p className={`mt-2 font-display text-2xl font-bold ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <motion.section
        initial="hidden"
        animate={loading ? 'hidden' : 'visible'}
        variants={listVariants}
        className="grid gap-4 md:grid-cols-2"
      >
        {loading
          ? [1, 2, 3, 4].map((item) => <SkeletonCard key={item} />)
            : safeItems.length === 0 ? (
              <div className="flat-card col-span-2 p-10 text-center">
                <p className="font-display text-xl font-bold text-foreground">No menu items yet</p>
                <p className="mt-2 text-sm text-foreground-muted">
                  The canteen team has not published today&apos;s menu.
                </p>
              </div>
            ) : (
              safeItems.map((item) => (
                <motion.div key={item._id} variants={itemVariants}>
                  <Card variant="glass" className="group h-full">
                    <div className="flex flex-col gap-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-display text-2xl font-bold text-foreground transition-colors group-hover:text-accent">{item.name}</h2>
                          <p className="mt-2 text-sm text-foreground-muted">{item.category || 'Campus menu'}</p>
                        </div>
                        <Badge status={item.status}>{statusLabel[item.status] || 'Available'}</Badge>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-display text-2xl font-bold text-foreground">₹{item.price}</p>
                          <p className="mt-1 text-sm text-foreground-muted">
                            Updated {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'recently'}
                          </p>
                        </div>
                        <div className="data-chip">
                          Chef&apos;s pick
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
      </motion.section>
    </div>
  );
}
