import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import AuthField from '../components/auth/AuthField';
import { supabase } from '../lib/supabaseClient';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

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

    if (!supabase) {
      setError('Password recovery is temporarily unavailable. Please try again later.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSent(true);
      toast.success('Reset link sent');
    } catch (resetError) {
      const message =
        resetError?.message?.toLowerCase().includes('rate limit')
          ? 'Too many requests. Please wait a moment and try again.'
          : 'We could not send the reset link. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title={
        <>
          Forgot your <span className="italic">password?</span>
        </>
      }
      description="Enter your account email and we will send you a secure link to choose a new password."
      footer={
        <p>
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-semibold text-accent transition-colors hover:text-accent-strong"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="space-y-3">
          <div
            className="flex items-start gap-2.5 rounded-xl border border-success/25 bg-success/10 px-4 py-3"
            role="status"
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
            <p className="text-sm leading-relaxed text-success">
              If an account exists for <strong>{email.trim().toLowerCase()}</strong>, you&apos;ll receive a
              password reset link shortly. Check your spam folder if it does not arrive.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSent(false)}
            className="inline-flex w-full items-center justify-center rounded-xl border border-border/70 bg-surface-secondary/70 px-4 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:bg-surface"
          >
            Send another link
          </button>
        </div>
      ) : (
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

          <AuthField label="Email" htmlFor="email" icon={<Mail size={16} />}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError('');
              }}
              className="input-field pl-11"
              placeholder="you@campus.edu"
            />
          </AuthField>

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default ForgotPasswordPage;
