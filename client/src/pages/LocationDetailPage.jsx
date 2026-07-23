import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import StarRating from '../components/StarRating';

const feedbackVariants = {
  hidden: { opacity: 0, y: 24 },
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
    return <div className="h-40 animate-pulse rounded-3xl bg-slate-800" />;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-2xl">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-primary-200">Location details</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl">{data?.location?.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{data?.location?.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Building</p>
                <p className="mt-3 text-lg font-semibold text-white">{data?.location?.building}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Average rating</p>
                <p className="mt-3 text-lg font-semibold text-white">{data?.averageRating} / 5</p>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden bg-slate-900/80">
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary-200">Share your experience</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Rate the location and leave a comment to help fellow students and staff.</p>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Your rating</p>
                <div className="mt-4">
                  <StarRating value={rating} onChange={setRating} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300">Your feedback</label>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Share what you liked or what could improve"
                  rows={5}
                  className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 transition-all duration-200 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/15"
                />
              </div>

              <Button loading={submitting} type="button" onClick={handleSubmit} className="w-full">
                Submit feedback
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold text-white">Recent feedback</h2>
        {sortedFeedback.length ? (
          <div className="grid gap-6">
            {sortedFeedback.map((feedback) => (
              <motion.div key={feedback._id} initial="hidden" animate="visible" variants={feedbackVariants} className="overflow-hidden">
                <Card className="bg-slate-900/80">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span>{feedback.userId?.name || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-primary-300">
                        {'★'.repeat(feedback.rating)}
                      </div>
                    </div>
                    <Badge status={feedback.rating >= 4 ? 'available' : feedback.rating === 3 ? 'limited' : 'soldOut'}>
                      {feedback.rating >= 4 ? 'Highly rated' : feedback.rating === 3 ? 'Needs attention' : 'Improve this place'}
                    </Badge>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">{feedback.comment || 'No comment provided.'}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No feedback yet. Be the first to leave a review.</p>
        )}
      </section>
    </main>
  );
}
