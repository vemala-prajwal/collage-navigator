import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import AuthField from '../components/auth/AuthField';
import { requestPasswordReset as apiRequestPasswordReset } from '../services/authApi';
import { supabase } from '../lib/supabaseClient';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOLDOWN_SECONDS = 60;

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

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

    // Only block if there is an active client-side cooldown (set after a
    // *successful* send). A rate-limit error from Supabase does NOT set this
    // cooldown, so the user is free to try again after the real quota resets.
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before sending another link.`);
      return;
    }

    setLoading(true);

    const siteUrl =
      import.meta.env.VITE_SITE_URL ||
      import.meta.env.NEXT_PUBLIC_SITE_URL ||
      window.location.origin;
    const targetRedirectTo = `${siteUrl}/reset-password`;

    let success = false;
    let errorMessage = '';
    // retryAfterSeconds is the real value Supabase returns (e.g. 54 seconds).
    // null means Supabase gave no specific window — likely a project-level
    // hourly quota exhaustion, not a per-user/per-IP limit.
    let retryAfterSeconds = null;

    // Primary: backend API (uses admin client, better rate-limit handling).
    try {
      await apiRequestPasswordReset(normalizedEmail, targetRedirectTo);
      success = true;
    } catch (apiErr) {
      const errText = apiErr?.message || '';
      // apiErr is a plain Error wrapped by authApi — it has no .response.
      // Rate-limit detection: rely on the retryAfterSeconds property that
      // authApi attaches from the backend 429 body, or the message text.
      retryAfterSeconds = apiErr?.retryAfterSeconds ?? null;

      const isRateLimitErr =
        retryAfterSeconds != null ||
        /rate.?limit|too.?many/i.test(errText);

      if (!isRateLimitErr) {
        // Non-rate-limit backend failure → try direct Supabase client as fallback.
        if (supabase) {
          try {
            const { error: sbErr } = await supabase.auth.resetPasswordForEmail(
              normalizedEmail,
              { redirectTo: targetRedirectTo }
            );
            if (!sbErr) {
              success = true;
            } else {
              const isSbRateLimit =
                sbErr.status === 429 ||
                /rate.?limit|too.?many|over_email/i.test(sbErr.message || '') ||
                /over_email_send_rate_limit/i.test(sbErr.code || '');

              if (isSbRateLimit) {
                // Try to parse Supabase's "after X seconds" message.
                const m = (sbErr.message || '').match(/after\s+(\d+)\s+second/i);
                retryAfterSeconds = m ? parseInt(m[1], 10) : null;
                errorMessage = retryAfterSeconds
                  ? `Please wait ${retryAfterSeconds} seconds before requesting another link.`
                  : 'Our email service has reached its sending limit. Please try again in a few minutes.';
              } else {
                errorMessage = sbErr.message || 'We could not send the reset link. Please try again.';
              }
            }
          } catch (sbThrown) {
            errorMessage = sbThrown?.message || 'We could not send the reset link. Please try again.';
          }
        } else {
          errorMessage = errText || 'We could not send the reset link. Please try again.';
        }
      } else {
        // Rate limit from backend API path.
        errorMessage = retryAfterSeconds
          ? `Please wait ${retryAfterSeconds} seconds before requesting another link.`
          : 'Our email service has reached its sending limit. Please try again in a few minutes.';
      }
    }

    setLoading(false);

    if (success) {
      setSent(true);
      // Cooldown ONLY fires on success — prevents double-clicking, but never
      // traps the user if Supabase itself is rate-limiting at the project level.
      setCooldown(COOLDOWN_SECONDS);
      toast.success('Reset link sent');
    } else {
      setError(errorMessage || 'We could not send the reset link. Please try again.');
      toast.error(errorMessage || 'We could not send the reset link. Please try again.');
      // Do NOT start the cooldown on error — the user should be free to retry
      // (or try a different email) once the real Supabase quota resets.
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
            disabled={cooldown > 0}
            onClick={() => setSent(false)}
            className="inline-flex w-full items-center justify-center rounded-xl border border-border/70 bg-surface-secondary/70 px-4 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Send another link'}
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
            disabled={loading || cooldown > 0}
            className="btn-gradient inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : cooldown > 0 ? (
              `Please wait ${cooldown}s`
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

