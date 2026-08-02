import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchCampuses } from '../services/authApi';
import { CAMPUSES } from '../lib/campuses';

const getPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, label: 'Enter a password', color: 'bg-border' };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length >= 12) score += 1;

  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-error', 'bg-amber-500', 'bg-yellow-500', 'bg-sky-500', 'bg-emerald-500'];

  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)] || 'Strong',
    color: colors[Math.min(score, 4)] || 'bg-emerald-500',
  };
};

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    campus: '',
    sanUsn: '',
    password: '',
    confirmPassword: '',
  });
  const [campuses, setCampuses] = useState(CAMPUSES);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCampuses = async () => {
      try {
        const data = await fetchCampuses();
        if (Array.isArray(data) && data.length > 0) {
          setCampuses(data);
        }
      } catch {
        setCampuses(CAMPUSES);
      }
    };

    loadCampuses();
  }, []);

  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!form.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!form.campus) {
      setError('Please select your campus.');
      return;
    }

    if (!form.sanUsn.trim()) {
      setError('Please enter your SAN/USN number.');
      return;
    }

    if (!/^[A-Za-z0-9]+$/.test(form.sanUsn.trim())) {
      setError('SAN/USN must contain only letters and numbers.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please retype them exactly the same.');
      return;
    }

    if (passwordStrength.score < 3) {
      setError('Please use a stronger password with uppercase letters, numbers, or symbols.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        campus: form.campus,
        sanUsn: form.sanUsn.trim().toUpperCase(),
      });
      toast.success('Account created successfully');
      navigate('/');
    } catch (err) {
      const message = err?.message || err?.response?.data?.message || 'Unable to create your account right now.';
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
          style={{ background: 'radial-gradient(circle, rgb(var(--color-accent2)/0.16) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="relative">
          <div className="mb-6 flex flex-col items-start gap-4">
            <span
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_24px_rgb(217_70_239/0.35)]"
              style={{ background: 'var(--gradient-accent)' }}
            >
              <GraduationCap size={20} className="text-white" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Join the campus</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Create your account</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-2xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-muted" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Alex Morgan"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-muted" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-muted" htmlFor="campus">
                Campus
              </label>
              <select
                id="campus"
                name="campus"
                value={form.campus}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select your campus</option>
                {campuses.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-muted" htmlFor="sanUsn">
                SAN / USN Number
              </label>
              <input
                id="sanUsn"
                name="sanUsn"
                type="text"
                value={form.sanUsn}
                onChange={handleChange}
                className="input-field uppercase placeholder:normal-case"
                placeholder="e.g. 1RN21CS001"
                maxLength={20}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-muted" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-foreground-muted"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-surface-secondary">
                  <div className={`h-2 rounded-full ${passwordStrength.color}`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-foreground-muted">{passwordStrength.label}</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-muted" htmlFor="confirmPassword">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-foreground-muted"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient flex w-full items-center justify-center rounded-full px-4 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-foreground-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
