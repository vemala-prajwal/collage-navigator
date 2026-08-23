import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, CircleOff, Clock3, UtensilsCrossed, Sparkles, Filter } from 'lucide-react';
import api from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import PageHeader from '../components/PageHeader';
import CanteenLogo from '../assets/canteen-logo.png';
import { SkeletonCard } from '../components/Skeleton';
import { fadeUp, staggerContainer } from '../lib/motion';
import usePageMeta from '../hooks/usePageMeta';

const statusLabel = {
  available: 'Available',
  limited: 'Limited Stock',
  soldOut: 'Sold Out',
};

export default function CanteenPage() {
  usePageMeta({
    title: 'Canteen Menu & Status',
    description: 'Check real-time canteen menu availability, pricing, and item status before walking to the campus dining hall.',
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

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

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const statusCounts = useMemo(() => {
    return safeItems.reduce(
      (counts, item) => {
        const status = item?.status || 'available';
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      },
      { available: 0, limited: 0, soldOut: 0 }
    );
  }, [safeItems]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return safeItems;
    return safeItems.filter((item) => (item?.status || 'available') === activeFilter);
  }, [safeItems, activeFilter]);

  return (
    <div className="canteen-page space-y-10">
      {/* Header Banner */}
      <PageHeader
        icon={UtensilsCrossed}
        eyebrow="Live Campus Dining"
        title="Fresh food menu, updated in real time."
        description="Scan today's live menu availability, check pricing, and avoid long canteen lines before you walk over."
      >
<<<<<<< HEAD
        <div className="relative overflow-hidden rounded-2xl border border-border/40 shadow-elevated">
          <img
            src={CanteenLogo}
            alt="Campus canteen hall"
            className="h-44 w-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent flex items-end p-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-accent border border-accent/30">
              <Sparkles size={13} /> Campus Central Dining Hall
            </span>
          </div>
        </div>
=======
        <img
          src={CanteenLogo}
          alt="Campus canteen logo"
          className="mx-auto h-44 w-44 rounded-full object-cover ring-1 ring-border"
        />
>>>>>>> 03d75daff3567e2c1d59e4a89b9b29222f5f273e
      </PageHeader>

      {/* Real-time Status Counters */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { key: 'available', label: 'Available Now', value: statusCounts.available, tone: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { key: 'limited', label: 'Limited Stock', value: statusCounts.limited, tone: 'text-amber-400', icon: Clock3, bg: 'bg-amber-500/10 border-amber-500/20' },
          { key: 'soldOut', label: 'Sold Out', value: statusCounts.soldOut, tone: 'text-rose-400', icon: CircleOff, bg: 'bg-rose-500/10 border-rose-500/20' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ y: -3 }}
              onClick={() => setActiveFilter(stat.key)}
              className={`card-surface rounded-2xl border p-5 cursor-pointer transition-all duration-300 ${
                activeFilter === stat.key
                  ? 'border-accent shadow-glow bg-surface-secondary/90'
                  : 'border-border/40 hover:border-border/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  {stat.label}
                </span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${stat.bg} ${stat.tone}`}>
                  <Icon size={16} />
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className={`font-display text-3xl font-extrabold ${stat.tone}`}>
                  {stat.value}
                </span>
                <span className="text-xs text-foreground-muted">Menu items</span>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Filter Tabs & Menu Grid */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/30 pb-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-accent" />
            <h2 className="font-display text-lg font-bold text-foreground">Today's Menu Items</h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'available', label: 'Available' },
              { id: 'limited', label: 'Limited' },
              { id: 'soldOut', label: 'Sold Out' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  activeFilter === tab.id
                    ? 'bg-accent text-white shadow-soft'
                    : 'bg-surface-secondary/80 text-foreground-muted hover:text-foreground hover:bg-surface-elevated'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <SkeletonCard key={item} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card title="No menu items in this category" className="empty-state text-center py-10" hover={false}>
            <p className="text-sm text-foreground-muted max-w-sm mx-auto">
              {activeFilter === 'all'
                ? "The canteen team hasn't published items for today yet."
                : `There are currently no menu items marked as "${statusLabel[activeFilter] || activeFilter}".`}
            </p>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.06, 0.03)}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredItems.map((item) => {
              const status = item?.status || 'available';

              return (
                <motion.div key={item._id || item.name} variants={fadeUp}>
                  <div className="card-surface glass-panel rounded-2xl border border-border/40 p-5 shadow-soft hover:shadow-elevated hover:border-accent/40 transition-all duration-300 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20">
                            <UtensilsCrossed size={18} />
                          </span>
                          <div>
                            <h3 className="font-display font-bold text-foreground text-base">
                              {item.name}
                            </h3>
                            <span className="text-xs text-foreground-muted">
                              {item.category || 'General Menu'}
                            </span>
                          </div>
                        </div>

                        <Badge status={status}>
                          {statusLabel[status] || 'Available'}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border/30 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-foreground-muted block">Price</span>
                        <span className="font-display text-lg font-bold text-accent">
                          ₹{item.price}
                        </span>
                      </div>

                      <span className="text-xs text-foreground-muted bg-surface-secondary px-2.5 py-1 rounded-lg border border-border/30">
                        {item.updatedAt ? `Updated ${new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  );
}
