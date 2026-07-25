import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login({ email: identifier, password });
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6 py-24">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-background/90 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.16)] backdrop-blur">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Welcome back</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Sign in to Campus Navigator</h1>
        </div>

<form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-muted" htmlFor="identifier">
                Username or email
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-0"
                placeholder="admin or you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-muted" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-0"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </form>

        <p className="mt-6 text-sm text-foreground-muted">
          New here?{' '}
          <Link to="/register" className="font-semibold text-accent">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
