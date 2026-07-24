import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function LocationDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-800 dark:bg-slate-900/70" />;
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{data?.location?.name}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{data?.location?.description}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
          <p className="text-sm text-slate-500 dark:text-slate-400">Building</p>
          <p className="mt-2 font-medium text-slate-900 dark:text-slate-100">{data?.location?.building}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
          <p className="text-sm text-slate-500 dark:text-slate-400">Average rating</p>
          <p className="mt-2 font-medium text-slate-900 dark:text-slate-100">{data?.averageRating} / 5</p>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Feedback</h2>
        <div className="mt-3 space-y-3">
          {data?.feedbacks?.length ? data.feedbacks.map((feedback) => (
            <div key={feedback._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800 dark:text-slate-100">{feedback.comment || 'No comment'}</span>
                <span className="text-amber-500">{'★'.repeat(feedback.rating)}</span>
              </div>
            </div>
          )) : <p className="text-slate-500 dark:text-slate-400">No feedback yet.</p>}
        </div>
      </div>
    </div>
  );
}
