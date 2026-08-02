import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: normalizedEmail, password });
      toast.success('Signed in successfully!');
      navigate('/');
    } catch (err) {
      const message = err?.message || 'Invalid email or password';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6 py-24">
      <div className="premium-card relative w-full max-w-md overflow-hidden p-8 sm:p-10">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgb(var(--color-accent)/0.16) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="relative">
          <div className="mb-6 flex flex-col items-start gap-4">
            <span
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_24px_rgb(109_40_217/0.35)]"
              style={{ background: 'var(--gradient-accent)' }}
            >
              <MapPin size={20} className="text-white" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Welcome back</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Sign in to Campus Navigator</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-2xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-muted" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError('');
                }}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-muted" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError('');
                }}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient inline-flex w-full items-center justify-center rounded-full px-4 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
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
    </div>
  );
}

export default LoginPage;
