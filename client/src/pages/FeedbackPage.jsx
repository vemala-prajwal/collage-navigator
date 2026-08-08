import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star } from 'lucide-react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import StarRating from '../components/StarRating';
import { SkeletonCard } from '../components/Skeleton';
import usePageMeta from '../hooks/usePageMeta';

const feedbackVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } },
};

const statusLabel = {
  available: 'Highly rated',
  limited: 'Needs attention',
  soldOut: 'Improve this place',
};

export default function FeedbackPage() {
  usePageMeta({
    title: 'Feedback',
    description: 'Submit feedback and browse the public feedback feed for campus locations and services.',
  });

  const [feedbacks, setFeedbacks] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-page space-y-10">
      <PageHeader
        icon={MessageSquare}
        eyebrow="Feedback"
        title="Help the campus improve with a few honest taps."
        description="Submit ratings and comments for locations, services, and facilities, then browse the public feedback feed for community insights."
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card variant="elevated" title="Leave feedback" icon={Star} className="feedback-form-card">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="card-data-item">
              <label className="card-label" htmlFor="feedback-rating">Your rating</label>
              <StarRating value={rating} onChange={setRating} id="feedback-rating" />
            </div>
            <div className="card-data-item">
              <label className="card-label" htmlFor="feedback-comment">Your thoughts</label>
              <textarea
                id="feedback-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Tell us what helped or what needs improvement"
                rows={5}
                className="input-field resize-y"
              />
            </div>
            <Button loading={submitting} type="submit" className="w-full">
              Submit feedback
            </Button>
            <p className="text-sm leading-6 text-foreground-muted">
              Your feedback helps prioritize campus updates and service improvements.
            </p>
          </form>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Community feed</p>
              <h2 className="text-2xl font-semibold text-foreground">Recent campus feedback</h2>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <SkeletonCard key={item} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.length === 0 ? (
                <Card title="No feedback yet" hover={false}>
                  <p className="text-sm leading-relaxed text-foreground-muted">
                    Be the first to share what the campus experience feels like.
                  </p>
                </Card>
              ) : (
                feedbacks.slice(0, 6).map((item) => (
                  <motion.div key={item._id} initial="hidden" animate="visible" variants={feedbackVariants}>
                    <Card
                      icon={MessageSquare}
                      title={item.user_name || 'Anonymous'}
                      status={<Badge status={item.rating >= 4 ? 'available' : item.rating === 3 ? 'limited' : 'soldOut'}>{statusLabel[item.status] || (item.rating >= 4 ? 'Highly rated' : item.rating === 3 ? 'Needs attention' : 'Improve this place')}</Badge>}
                      hover={false}
                    >
                      <p className="text-sm leading-relaxed text-foreground-muted">{item.comment || 'No comment provided.'}</p>
                      <div className="card-meta-row mt-4">
                        <span className="card-label">Rating</span>
                        <span className="text-accent">{'★'.repeat(item.rating)}</span>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
