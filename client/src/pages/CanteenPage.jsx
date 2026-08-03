import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CircleOff, Clock3, UtensilsCrossed } from 'lucide-react';
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
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
    <div className="canteen-page">
      <PageHeader
        icon={UtensilsCrossed}
        eyebrow="Canteen menu"
        title="Fresh campus food, status-first."
        description="Scan the live menu, see availability instantly, and spot the fastest line with confidence."
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Available', value: statusCounts.available, tone: 'text-success', icon: CheckCircle2 },
          { label: 'Limited', value: statusCounts.limited, tone: 'text-warning', icon: Clock3 },
          { label: 'Sold out', value: statusCounts.soldOut, tone: 'text-error', icon: CircleOff },
        ].map((stat) => (
          <div key={stat.label} className="card-surface flat-card canteen-stat">
            <div className="card-header">
              <div className="card-header__main">
                <span className="card-header__icon" aria-hidden="true">
                  <stat.icon size={16} strokeWidth={1.8} />
                </span>
                <span className="card-title">{stat.label}</span>
              </div>
            </div>
            <div className="card-data-item">
              <span className="card-label">Items</span>
              <span className={`card-value ${stat.tone}`}>{stat.value}</span>
            </div>
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
              <div className="card-surface flat-card empty-state col-span-1 sm:col-span-2">
                <div className="card-header">
                  <div className="card-header__main">
                    <span className="card-header__icon" aria-hidden="true">
                      <UtensilsCrossed size={16} strokeWidth={1.8} />
                    </span>
                    <h2 className="card-title">No menu items yet</h2>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-sm text-foreground-muted">
                    The canteen team has not published today&apos;s menu.
                  </p>
                </div>
              </div>
            ) : (
              safeItems.map((item) => (
                <motion.div key={item._id} variants={itemVariants}>
                  <Card
                    variant="glass"
                    hover={false}
                    icon={UtensilsCrossed}
                    title={item.name}
                    status={<Badge status={item.status}>{statusLabel[item.status] || 'Available'}</Badge>}
                    className="menu-card h-full"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="card-data-grid card-data-grid--two menu-divider border-t border-border pt-3">
                        <div className="card-data-item">
                          <span className="card-label">Category</span>
                          <span className="card-value text-base">{item.category || 'Campus menu'}</span>
                        </div>
                        <div className="card-data-item">
                          <span className="card-label">Price</span>
                          <span className="card-value">₹{item.price}</span>
                        </div>
                      </div>
                      <div className="card-meta-row">
                        <span className="card-label">Updated</span>
                        <span>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Recently'}</span>
                        <span aria-hidden="true">·</span>
                        <span>Chef&apos;s pick</span>
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
