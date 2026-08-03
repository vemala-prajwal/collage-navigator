import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  ChevronDown,
  CheckCircle2,
  Eye,
  EyeOff,
  Hash,
  Loader2,
  Lock,
  Mail,
  MapPin,
  User,
} from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import AuthField from '../components/auth/AuthField';
import { useAuth } from '../context/AuthContext';
import { fetchCampuses } from '../services/authApi';
import { CAMPUSES } from '../lib/campuses';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, label: 'Enter a password', color: 'bg-accent' };
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
  const [success, setSuccess] = useState('');

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
    if (success) setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!form.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setError('Please enter a valid email address.');
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
      const result = await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        campus: form.campus,
        sanUsn: form.sanUsn.trim().toUpperCase(),
      });

      if (result.requiresEmailConfirmation) {
        setSuccess(
          result.message ||
            `Account created. Check ${form.email.trim().toLowerCase()} to confirm your email before signing in.`
        );
        toast.success('Check your email to finish signing up');
        return;
      }

      toast.success('Account created successfully');
      navigate('/');
    } catch (err) {
      const message =
        err?.message || err?.response?.data?.message || 'Unable to create your account right now.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Join the campus"
      title={
        <>
          Create your <span className="italic">account.</span>
        </>
      }
      description="A few details are all it takes to start navigating smarter."
      footer={
        <p>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-accent transition-colors hover:text-accent-strong"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form space-y-3" noValidate>
        {error && (
          <div
            className="auth-error flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/10 px-4 py-3"
            role="alert"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" />
            <p className="text-sm font-medium text-error">{error}</p>
          </div>
        )}

        {success && (
          <div
            className="flex items-start gap-2.5 rounded-xl border border-success/25 bg-success/10 px-4 py-3"
            role="status"
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
            <p className="text-sm font-medium text-success">{success}</p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <AuthField label="Full name" htmlFor="name" icon={<User size={16} />}>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={form.name}
              onChange={handleChange}
              className="input-field pl-11"
              placeholder="Alex Morgan"
            />
          </AuthField>

          <AuthField label="SAN / USN" htmlFor="sanUsn" icon={<Hash size={16} />}>
            <input
              id="sanUsn"
              name="sanUsn"
              type="text"
              autoComplete="off"
              required
              value={form.sanUsn}
              onChange={handleChange}
              className="input-field pl-11 uppercase placeholder:normal-case"
              placeholder="1RN21CS001"
              maxLength={20}
            />
          </AuthField>
        </div>

        <AuthField label="Email" htmlFor="email" icon={<Mail size={16} />}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            className="input-field pl-11"
            placeholder="you@campus.edu"
          />
        </AuthField>

        <AuthField label="Campus" htmlFor="campus" icon={<MapPin size={16} />}>
          <select
            id="campus"
            name="campus"
            required
            value={form.campus}
            onChange={handleChange}
            className="input-field appearance-none pl-11 pr-10"
          >
            <option value="">Select your campus</option>
            {campuses.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted/60"
          />
        </AuthField>

        <div>
          <AuthField label="Password" htmlFor="password" icon={<Lock size={16} />}>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange}
              className="input-field pr-12 pl-11"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-foreground-muted transition-colors hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </AuthField>

          <div className="mt-2 flex items-center gap-1.5">
            {[0, 1, 2, 3].map((segment) => (
              <span
                key={segment}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  form.password && segment < passwordStrength.score
                    ? passwordStrength.color
                    : 'bg-border/60'
                }`}
              />
            ))}
            <span className="ml-1.5 text-xs font-semibold text-foreground-muted">
              {passwordStrength.label}
            </span>
          </div>
        </div>

        <AuthField label="Confirm password" htmlFor="confirmPassword" icon={<Lock size={16} />}>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={form.confirmPassword}
            onChange={handleChange}
            className="input-field pr-12 pl-11"
            placeholder="Re-enter your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-foreground-muted transition-colors hover:text-foreground"
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </AuthField>

        <button
          type="submit"
          disabled={loading}
          className="btn-gradient flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
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
    </AuthShell>
  );
}

export default RegisterPage;
