import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import StarRating from '../components/StarRating';
import { Skeleton, SkeletonCard } from '../components/Skeleton';

const feedbackVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function LocationDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await api.get(`/locations/${id}`);
        setData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  const sortedFeedback = useMemo(
    () => [...(data?.feedbacks || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [data?.feedbacks]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rating) return;

    setSubmitting(true);
    try {
      await api.post('/feedback', {
        targetType: 'location',
        targetId: id,
        rating,
        comment,
      });
      const response = await api.get(`/locations/${id}`);
      setData(response.data);
      setComment('');
      setRating(0);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div>
      <section className="glass-panel mb-10 rounded-3xl p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow">Location details</p>
            <h1 className="mt-3 font-display text-display-md font-extrabold text-foreground">
              {data?.location?.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-foreground-muted">
              {data?.location?.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface-secondary p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground-muted">Building</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{data?.location?.building}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-secondary p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground-muted">
                  Average rating
                </p>
                <p className="mt-3 text-lg font-semibold text-foreground">{data?.averageRating} / 5</p>
              </div>
            </div>
          </div>

          <Card variant="elevated" hover={false}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <p className="eyebrow text-[0.65rem]">Share your experience</p>
                <p className="mt-2 text-sm leading-6 text-foreground-muted">
                  Rate the location and leave a comment to help fellow students and staff.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Your rating</p>
                <div className="mt-4">
                  <StarRating value={rating} onChange={setRating} />
                </div>
              </div>

              <div>
                <label htmlFor="feedback-comment" className="block text-sm font-semibold text-foreground">
                  Your feedback
                </label>
                <textarea
                  id="feedback-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Share what you liked or what could improve"
                  rows={5}
                  className="input-field mt-3 resize-y"
                />
              </div>

              <Button loading={submitting} type="submit" className="w-full">
                Submit feedback
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-foreground">Recent feedback</h2>
        {sortedFeedback.length ? (
          <div className="grid gap-6">
            {sortedFeedback.map((feedback) => (
              <motion.div key={feedback._id} initial="hidden" animate="visible" variants={feedbackVariants}>
                <Card variant="glass">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-sm text-foreground-muted">
                        <span>{feedback.userId?.name || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-accent">
                        {'★'.repeat(feedback.rating)}
                      </div>
                    </div>
                    <Badge
                      status={
                        feedback.rating >= 4 ? 'available' : feedback.rating === 3 ? 'limited' : 'soldOut'
                      }
                    >
                      {feedback.rating >= 4
                        ? 'Highly rated'
                        : feedback.rating === 3
                          ? 'Needs attention'
                          : 'Improve this place'}
                    </Badge>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-foreground-muted">
                    {feedback.comment || 'No comment provided.'}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-foreground-muted">No feedback yet. Be the first to leave a review.</p>
        )}
      </section>
    </div>
  );
}
