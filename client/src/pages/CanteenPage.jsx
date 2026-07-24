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
    <div>
      <PageHeader
        eyebrow="Canteen menu"
        title="Fresh campus food, status-first."
        description="Scan the live menu, see availability instantly, and spot the fastest line with confidence."
      />

      <motion.section
        initial="hidden"
        animate={loading ? 'hidden' : 'visible'}
        variants={listVariants}
        className="grid gap-6 md:grid-cols-2"
      >
        {loading
          ? [1, 2, 3, 4].map((item) => <SkeletonCard key={item} />)
          : items.map((item) => (
              <motion.div key={item._id} variants={itemVariants}>
                <Card variant="glass" className="h-full">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-2xl font-bold text-foreground">{item.name}</h2>
                        <p className="mt-2 text-sm text-foreground-muted">{item.category}</p>
                      </div>
                      <Badge status={item.status}>{statusLabel[item.status] || 'Available'}</Badge>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-foreground">₹{item.price}</p>
                        <p className="mt-1 text-sm text-foreground-muted">
                          Updated {new Date(item.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-surface-secondary px-4 py-2 text-sm font-semibold text-foreground-muted">
                        Chef&apos;s pick
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
      </motion.section>
    </div>
  );
}
