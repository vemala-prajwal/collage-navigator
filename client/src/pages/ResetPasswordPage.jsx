import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import SetNewPasswordForm from '../components/auth/SetNewPasswordForm';
import { supabase } from '../lib/supabaseClient';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return undefined;
    }

    let active = true;
    // Track whether the PASSWORD_RECOVERY event has already fired so we know
    // not to flip hasRecoverySession to false from getSession().
    let recoveryFired = false;

    // Register the auth state listener FIRST so we never miss the
    // PASSWORD_RECOVERY event that Supabase emits synchronously when it
    // detects a valid recovery token in the URL hash.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === 'PASSWORD_RECOVERY' && session) {
        recoveryFired = true;
        setHasRecoverySession(true);
        setCheckingSession(false);
      }
    });

    // Fall back to getSession() for cases where the browser already exchanged
    // the URL token for a session before this component mounted (e.g. hard
    // refresh on the /reset-password page while a session is still alive).
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      // Only update state from getSession() if the auth state listener did
      // not already handle the PASSWORD_RECOVERY event.
      if (!recoveryFired) {
        setHasRecoverySession(Boolean(data.session));
        setCheckingSession(false);
      }
    };

    checkSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (password) => {
    setError('');

    if (!supabase || !hasRecoverySession) {
      setError('This reset link is invalid or has expired. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        throw updateError;
      }

      try {
        await supabase.auth.signOut();
      } catch {
        // The password is already updated; a failed cleanup should not report
        // the reset as unsuccessful.
      }
      setSuccess(true);
      toast.success('Password updated successfully');
    } catch (updateError) {
      const message = updateError?.message?.toLowerCase().includes('expired')
        ? 'This reset link has expired. Please request a new one.'
        : 'We could not update your password. Please request a new reset link and try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Secure your account"
      title={
        success ? (
          <>
            Password <span className="italic">updated.</span>
          </>
        ) : (
          <>
            Choose a new <span className="italic">password.</span>
          </>
        )
      }
      description={
        success
          ? 'Your account is secure again. Sign in with your new password to continue.'
          : 'Use a strong password you have not used elsewhere.'
      }
      footer={
        <p>
          <Link
            to="/login"
            className="font-semibold text-accent transition-colors hover:text-accent-strong"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      {checkingSession ? (
        <div className="flex items-center justify-center py-8 text-sm font-medium text-foreground-muted">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verifying your reset link...
        </div>
      ) : success ? (
        <div className="space-y-3">
          <div
            className="flex items-start gap-2.5 rounded-xl border border-success/25 bg-success/10 px-4 py-3"
            role="status"
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
            <p className="text-sm leading-relaxed text-success">
              Your password has been changed successfully. You can now sign in with it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-gradient inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold"
          >
            Continue to sign in
          </button>
        </div>
      ) : hasRecoverySession ? (
        <SetNewPasswordForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onClearError={() => setError('')}
          submitLabel="Update password"
          loadingLabel="Updating password..."
        />
      ) : (
        <div className="space-y-3">
          <div
            className="flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/10 px-4 py-3"
            role="alert"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" />
            <p className="text-sm leading-relaxed text-error">
              This reset link is invalid or has expired. Request a fresh link to continue.
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="btn-gradient inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold"
          >
            Request a new link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}

export default ResetPasswordPage;
