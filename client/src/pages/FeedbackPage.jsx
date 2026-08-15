import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, Send, Sparkles, User, ThumbsUp } from 'lucide-react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import StarRating from '../components/StarRating';
import { SkeletonCard } from '../components/Skeleton';
import { fadeUp, staggerContainer } from '../lib/motion';
import usePageMeta from '../hooks/usePageMeta';

const statusLabel = {
  available: 'Highly rated',
  limited: 'Needs attention',
  soldOut: 'Improve this place',
};

export default function FeedbackPage() {
  usePageMeta({
    title: 'Community Feedback',
    description: 'Submit feedback, rate campus facilities, and browse community insights to help improve college life.',
  });

  const [feedbacks, setFeedbacks] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await api.get('/feedback');
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.feedback)
          ? response.data.feedback
          : [];
        setFeedbacks(list);
      } catch (error) {
        console.error(error);
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
    const subscription = api.subscribe('feedback', () => {
      fetchFeedback();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rating) return;

    setSubmitting(true);
    try {
      await api.post('/feedback', {
        targetType: 'general',
        targetId: 'site',
        rating,
        comment,
      });
      setRating(0);
      setComment('');
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-page space-y-12">
      <PageHeader
        icon={MessageSquare}
        eyebrow="Community Voice"
        title="Help shape a better campus experience."
        description="Share ratings, report facility issues, or suggest updates. Your voice directly guides campus team improvements."
      />

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Form Card */}
        <div className="card-surface glass-panel rounded-3xl border border-border/50 p-6 sm:p-8 shadow-elevated h-fit">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/30">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white shadow-glow">
              <Star size={20} />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Leave Your Feedback</h2>
              <p className="text-xs text-foreground-muted">Honest reviews keep campus data accurate.</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted block mb-2" htmlFor="feedback-rating">
                Your Rating (1 to 5 Stars)
              </label>
              <div className="p-3 rounded-2xl bg-surface-secondary/80 border border-border/40 inline-block">
                <StarRating value={rating} onChange={setRating} id="feedback-rating" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted block mb-2" htmlFor="feedback-comment">
                Your Thoughts & Suggestions
              </label>
              <textarea
                id="feedback-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="What campus locations or services need attention? Share your thoughts…"
                rows={4}
                className="w-full rounded-2xl border border-border/50 bg-surface-secondary/80 p-4 text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-y"
              />
            </div>

            <Button
              loading={submitting}
              type="submit"
              disabled={!rating}
              className="w-full btn-gradient flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-soft"
            >
              <Send size={16} />
              <span>Submit Campus Feedback</span>
            </Button>

            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs text-emerald-300 flex items-center gap-2"
                >
                  <ThumbsUp size={16} className="shrink-0" />
                  <span>Thank you! Your feedback has been recorded and posted to the community feed.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Public Feedback Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <div>
              <span className="eyebrow text-accent">Public Insights</span>
              <h2 className="font-display text-xl font-bold text-foreground">Recent Student Reviews</h2>
            </div>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent border border-accent/20">
              Live Feed
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <SkeletonCard key={item} />
              ))}
            </div>
          ) : feedbacks.length === 0 ? (
            <Card title="No feedback entries yet" className="empty-state text-center py-10" hover={false}>
              <p className="text-sm text-foreground-muted max-w-xs mx-auto">
                Be the first student to post a review and guide your peers!
              </p>
            </Card>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer(0.08, 0.04)}
              className="space-y-4"
            >
              {feedbacks.slice(0, 6).map((item) => (
                <motion.div key={item._id} variants={fadeUp}>
                  <div className="card-surface glass-panel-interactive rounded-2xl border border-border/40 p-5 shadow-soft">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated text-accent border border-border/40">
                          <User size={16} />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-foreground text-sm">
                            {item.user_name || 'Campus Student'}
                          </h3>
                          <div className="flex items-center gap-1 text-amber-400 text-xs mt-0.5">
                            {'★'.repeat(item.rating)}
                            <span className="text-foreground-muted ml-1 font-mono text-[11px]">{item.rating}/5</span>
                          </div>
                        </div>
                      </div>

                      <Badge status={item.rating >= 4 ? 'available' : item.rating === 3 ? 'limited' : 'soldOut'}>
                        {item.rating >= 4 ? 'Highly Rated' : item.rating === 3 ? 'Needs Attention' : 'Needs Fix'}
                      </Badge>
                    </div>

                    <p className="text-xs leading-relaxed text-foreground-muted">
                      {item.comment || 'No comment text provided.'}
                    </p>

                    <div className="mt-3 pt-2 border-t border-border/20 flex items-center justify-between text-[11px] text-foreground-muted">
                      <span>General Feedback</span>
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
