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
    return <div className="h-40 animate-pulse rounded-2xl bg-slate-800" />;
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
      <h1 className="text-2xl font-semibold">{data?.location?.name}</h1>
      <p className="mt-2 text-slate-400">{data?.location?.description}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Building</p>
          <p className="mt-2 font-medium">{data?.location?.building}</p>
        </div>
        <div className="rounded-2xl bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Average rating</p>
          <p className="mt-2 font-medium">{data?.averageRating} / 5</p>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Feedback</h2>
        <div className="mt-3 space-y-3">
          {data?.feedbacks?.length ? data.feedbacks.map((feedback) => (
            <div key={feedback._id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{feedback.comment || 'No comment'}</span>
                <span className="text-amber-400">{'★'.repeat(feedback.rating)}</span>
              </div>
            </div>
          )) : <p className="text-slate-400">No feedback yet.</p>}
        </div>
      </div>
    </div>
  );
}
