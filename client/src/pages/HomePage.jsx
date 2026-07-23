import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Hero from '../components/Hero';
import Card from '../components/Card';
import { SkeletonCard } from '../components/Skeleton';

export default function HomePage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('/locations');
        setLocations(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div className="space-y-14">
      <Hero />

      <section>
        <h2 className="mb-8 font-display text-2xl font-bold text-foreground">Popular locations</h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {locations.map((location) => (
              <Link key={location._id} to={`/locations/${location._id}`} className="group block">
                <Card variant="glass" className="transition-transform duration-200 group-hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">{location.name}</h3>
                      <p className="mt-1 text-sm text-foreground-muted">
                        {location.building} • Floor {location.floor}
                      </p>
                    </div>
                    <span className="rounded-full border border-border bg-surface-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                      {location.type}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
