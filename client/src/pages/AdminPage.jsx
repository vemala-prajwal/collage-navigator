import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adminStats, setAdminStats] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      setAdminStats({
        locations: 123,
        users: 540,
        feedback: 87,
        activeSessions: 18,
      });
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="section-container section-gap">
      <div className="max-w-5xl">
        <div className="mb-8 rounded-[2rem] border border-border/60 bg-surface-secondary/80 p-8 shadow-card backdrop-blur-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Admin dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground-muted">
            This page is hidden from the public navigation. Only the admin account can access it.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {adminStats && [
            { label: 'Mapped locations', value: adminStats.locations },
            { label: 'Registered users', value: adminStats.users },
            { label: 'Feedback items', value: adminStats.feedback },
            { label: 'Active sessions', value: adminStats.activeSessions },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[1.5rem] border border-border/60 bg-background/80 p-6 shadow-soft">
              <p className="text-sm font-medium uppercase tracking-[0.32em] text-foreground-muted">{stat.label}</p>
              <p className="mt-6 text-3xl font-semibold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
