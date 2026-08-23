import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StarRating from '../components/StarRating';
import { SkeletonCard } from '../components/Skeleton';
import api from '../services/api';
import { fadeUp, staggerContainer } from '../lib/motion';
import usePageMeta from '../hooks/usePageMeta';

export default function FeedbackPage() {
  usePageMeta({
    title: 'Feedback',
    description: 'Browse recent community feedback for campus facilities and see how students are rating their on-campus experience.',
  });

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const response = await api.get('/feedback');
        const list = Array.isArray(response?.data) ? response.data : [];
        setFeedbacks(list);
      } catch (error) {
        console.error(error);
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
    const subscription = api.subscribe('feedback', fetchFeedback);
    return () => subscription.unsubscribe();
  }, []);

  const averageRating = useMemo(() => {
    if (!feedbacks.length) return '0.0';
    const avg = feedbacks.reduce((sum, item) => sum + Number(item?.rating || 0), 0) / feedbacks.length;
    return avg.toFixed(1);
  }, [feedbacks]);

  return (
    <div className="feedback-page space-y-10">
      <PageHeader
        icon={MessageSquare}
        eyebrow="Community Voice"
        title="Student feedback across campus"
        description="Read recent ratings and comments shared by students. Submit feedback directly from location detail pages."
        status={<span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">{feedbacks.length} total</span>}
      >
        <div className="rounded-2xl border border-border/40 bg-surface-secondary/55 p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-foreground-muted">Average Rating</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">{averageRating} / 5</p>
          <div className="mt-3 inline-flex rounded-xl border border-border/40 bg-surface px-3 py-2">
            <StarRating value={Math.round(Number(averageRating))} readOnly />
          </div>
        </div>
      </PageHeader>

      <section className="section-container">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <SkeletonCard key={item} />
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <Card title="No feedback yet" className="text-center py-10" hover={false}>
            <p className="mx-auto max-w-md text-sm text-foreground-muted">
              No reviews have been posted yet. Open a location page and add a rating to start the community feed.
            </p>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.08, 0.04)}
            className="grid gap-4 md:grid-cols-2"
          >
            {feedbacks.map((feedback, index) => (
              <motion.div key={feedback._id || `${feedback.targetId}-${index}`} variants={fadeUp}>
                <div className="card-surface rounded-2xl border border-border/40 p-5 shadow-soft">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                        {feedback.targetType || 'Location'} review
                      </p>
                      <p className="mt-1 text-xs text-foreground-muted">Target ID: {feedback.targetId || 'Unknown'}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                      <Star size={12} /> {feedback.rating || 0}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-foreground-muted">{feedback.comment || 'No comment provided.'}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
