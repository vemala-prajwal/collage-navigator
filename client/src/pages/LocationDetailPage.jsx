import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, MessageSquare, Star } from 'lucide-react';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import StarRating from '../components/StarRating';
import { Skeleton, SkeletonCard } from '../components/Skeleton';

const feedbackVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};

const statusMap = {
  available: 'available',
  limited: 'limited',
  soldOut: 'soldOut',
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
    const locationSubscription = api.subscribe('locations', () => {
      fetchLocation();
    });
    const feedbackSubscription = api.subscribe('feedback', () => {
      fetchLocation();
    });

    return () => {
      locationSubscription.unsubscribe();
      feedbackSubscription.unsubscribe();
    };
  }, [id]);

  const sortedFeedback = useMemo(
    () => [...(data?.feedbacks || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [data?.feedbacks]
  );

  const locationStatus = statusMap[data?.location?.status];

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
      <div className="location-page space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="location-page">
      <section className="card-surface glass-panel location-hero mb-10">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="card-header">
              <div className="card-header__main">
                <span className="card-header__icon" aria-hidden="true">
                  <MapPin size={18} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="eyebrow">Location details</p>
                  <h1 className="font-display text-display-md font-extrabold text-foreground">
                    {data?.location?.name}
                  </h1>
                </div>
              </div>
              {locationStatus ? (
                <Badge status={locationStatus}>
                  {locationStatus === 'available' ? 'Open now' : locationStatus === 'limited' ? 'Limited' : 'Closed'}
                </Badge>
              ) : null}
            </div>
            <p className="max-w-2xl text-base leading-7 text-foreground-muted">
              {data?.location?.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="card-surface location-meta">
                <div className="card-header">
                  <div className="card-header__main">
                    <span className="card-header__icon" aria-hidden="true">
                      <Building2 size={16} strokeWidth={1.8} />
                    </span>
                    <span className="card-title">Building</span>
                  </div>
                </div>
                <div className="card-data-item">
                  <span className="card-label">Assigned building</span>
                  <span className="card-value">{data?.location?.building}</span>
                </div>
              </div>
              <div className="card-surface location-meta">
                <div className="card-header">
                  <div className="card-header__main">
                    <span className="card-header__icon" aria-hidden="true">
                      <Star size={16} strokeWidth={1.8} />
                    </span>
                    <span className="card-title">Average rating</span>
                  </div>
                </div>
                <div className="card-data-item">
                  <span className="card-label">Community score</span>
                  <span className="card-value">{data?.averageRating} / 5</span>
                </div>
              </div>
            </div>
          </div>

          <Card variant="elevated" hover={false} icon={MessageSquare} title="Share your experience">
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <p className="text-sm leading-6 text-foreground-muted">
                Rate the location and leave a comment to help fellow students and staff.
              </p>

              <div className="card-data-item">
                <p className="card-label">Your rating</p>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div className="card-data-item">
                <label htmlFor="feedback-comment" className="card-label text-foreground">
                  Your feedback
                </label>
                <textarea
                  id="feedback-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Share what you liked or what could improve"
                  rows={5}
                  className="input-field resize-y"
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
          <div className="grid gap-4">
            {sortedFeedback.map((feedback) => (
              <motion.div key={feedback._id} initial="hidden" animate="visible" variants={feedbackVariants}>
                <Card
                  variant="glass"
                  hover={false}
                  icon={MessageSquare}
                  title={feedback.userId?.name || 'Anonymous'}
                  status={
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
                  }
                >
                  <div className="card-data-grid card-data-grid--two">
                    <div className="card-data-item">
                      <span className="card-label">Posted</span>
                      <span className="card-value text-base">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="card-data-item">
                      <span className="card-label">Rating</span>
                      <span className="card-value text-accent">{'★'.repeat(feedback.rating)}</span>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-foreground-muted">
                    {feedback.comment || 'No comment provided.'}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="feedback-empty text-foreground-muted">No feedback yet. Be the first to leave a review.</p>
        )}
      </section>
    </div>
  );
}
