import { useEffect, useMemo, useState } from 'react';
<<<<<<< HEAD
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, MessageSquare, Star, Send, ThumbsUp, ArrowLeft, Navigation, ShieldCheck, Clock } from 'lucide-react';
=======
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, MessageSquare } from 'lucide-react';
import RatingsLogo from '../assets/ratings-logo.png';
>>>>>>> 03d75daff3567e2c1d59e4a89b9b29222f5f273e
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import StarRating from '../components/StarRating';
import { Skeleton, SkeletonCard } from '../components/Skeleton';
import { fadeUp, staggerContainer } from '../lib/motion';
import usePageMeta from '../hooks/usePageMeta';

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
  const [successMsg, setSuccessMsg] = useState(false);

  usePageMeta({
    title: data?.location?.name || 'Location Details',
    description: `Explore campus location details, building info, and community reviews for ${data?.location?.name || 'this location'}.`,
  });

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
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="location-page space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="location-detail-page space-y-12 pb-12">
      {/* Back Navigation */}
      <div>
        <Link
          to="/navigate"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent hover:text-accent2 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Campus Search</span>
        </Link>
      </div>

      {/* Hero Location Specs Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-secondary via-background to-surface border border-accent/30 p-6 sm:p-10 shadow-elevated">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-on-accent font-bold shadow-glow">
                  <MapPin size={22} />
                </span>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {data?.location?.type || 'Campus Facility'}
                  </span>
                  <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight">
                    {data?.location?.name}
                  </h1>
                </div>
              </div>
              {locationStatus ? (
                <Badge status={locationStatus}>
                  {locationStatus === 'available' ? 'Open Now' : locationStatus === 'limited' ? 'Limited Access' : 'Closed'}
                </Badge>
              ) : null}
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-foreground-muted max-w-xl">
              {data?.location?.description || 'Campus building destination with turn-by-turn route access and community reviews.'}
            </p>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-2xl bg-surface-secondary/80 border border-border/40 p-4">
                <div className="flex items-center gap-1.5 text-xs text-foreground-muted mb-1">
                  <Building2 size={13} className="text-accent" />
                  <span>Building</span>
                </div>
                <span className="font-display text-base font-bold text-foreground">
                  {data?.location?.building || 'Main Campus'}
                </span>
              </div>
<<<<<<< HEAD

              <div className="rounded-2xl bg-surface-secondary/80 border border-border/40 p-4">
                <div className="flex items-center gap-1.5 text-xs text-foreground-muted mb-1">
                  <Star size={13} className="text-amber-400" />
                  <span>Avg Rating</span>
=======
              <div className="card-surface location-meta">
                <div className="card-header">
                  <div className="card-header__main">
                    <span className="card-header__icon" aria-hidden="true">
                      <img src={RatingsLogo} alt="Ratings logo" className="h-6 w-6 rounded object-cover" />
                    </span>
                    <span className="card-title">Average rating</span>
                  </div>
>>>>>>> 03d75daff3567e2c1d59e4a89b9b29222f5f273e
                </div>
                <span className="font-display text-base font-bold text-foreground">
                  {data?.averageRating ? `${data.averageRating} / 5` : 'New'}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-2xl bg-surface-secondary/80 border border-border/40 p-4">
                <div className="flex items-center gap-1.5 text-xs text-foreground-muted mb-1">
                  <Clock size={13} className="text-emerald-400" />
                  <span>Walk Time</span>
                </div>
                <span className="font-display text-base font-bold text-foreground">
                  ~3 mins
                </span>
              </div>
            </div>
          </div>

          {/* Location Feedback Submission Box */}
          <div className="card-surface glass-panel rounded-2xl border border-border/50 p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border/30 pb-3">
              <MessageSquare size={18} className="text-accent" />
              <h3 className="font-display text-base font-bold text-foreground">Rate This Location</h3>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted block mb-1.5">
                  Rating
                </label>
                <div className="p-2.5 rounded-xl bg-surface-secondary border border-border/40 inline-block">
                  <StarRating value={rating} onChange={setRating} />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted block mb-1.5" htmlFor="location-comment">
                  Comment
                </label>
                <textarea
                  id="location-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Share details about seating, noise level, or equipment…"
                  rows={3}
                  className="w-full rounded-xl border border-border/50 bg-surface-secondary p-3 text-xs text-foreground placeholder:text-foreground-muted/50 focus:border-accent focus:outline-none resize-y"
                />
              </div>

              <Button
                loading={submitting}
                type="submit"
                disabled={!rating}
                className="w-full btn-gradient flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-on-accent"
              >
                <Send size={14} />
                <span>Submit Location Review</span>
              </Button>

              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center gap-2"
                  >
                    <ThumbsUp size={14} />
                    <span>Review added to community feed!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </section>

      {/* Community Feed for This Location */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/30 pb-4">
          <div>
            <span className="eyebrow text-accent">Student Feedback</span>
            <h2 className="font-display text-2xl font-bold text-foreground">Location Reviews</h2>
          </div>
          <span className="text-xs text-foreground-muted font-mono">{sortedFeedback.length} total reviews</span>
        </div>

        {sortedFeedback.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.06, 0.03)}
            className="grid gap-4 md:grid-cols-2"
          >
            {sortedFeedback.map((feedback) => (
              <motion.div key={feedback._id} variants={fadeUp}>
                <div className="card-surface glass-panel rounded-2xl border border-border/40 p-5 shadow-soft space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-display font-bold text-foreground text-sm">
                        {feedback.userId?.name || 'Campus Student'}
                      </h4>
                      <div className="flex items-center gap-1 text-amber-400 text-xs mt-0.5">
                        {'★'.repeat(feedback.rating)}
                        <span className="text-foreground-muted ml-1 text-[11px]">{feedback.rating}/5</span>
                      </div>
                    </div>
                    <Badge status={feedback.rating >= 4 ? 'available' : feedback.rating === 3 ? 'limited' : 'soldOut'}>
                      {feedback.rating >= 4 ? 'Recommended' : feedback.rating === 3 ? 'Fair' : 'Needs Fix'}
                    </Badge>
                  </div>

                  <p className="text-xs leading-relaxed text-foreground-muted">
                    {feedback.comment || 'No written details provided.'}
                  </p>

                  <div className="pt-2 border-t border-border/20 flex justify-between text-[11px] text-foreground-muted">
                    <span>Verified Visit</span>
                    <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card title="No location reviews yet" className="empty-state text-center py-8" hover={false}>
            <p className="text-xs text-foreground-muted max-w-xs mx-auto">
              Be the first student to review this location!
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
