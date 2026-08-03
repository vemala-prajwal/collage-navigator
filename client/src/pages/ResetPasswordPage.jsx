import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import AuthField from '../components/auth/AuthField';
import { PASSWORD_CHECKS, getPasswordStrength } from '../lib/passwordStrength';
import { supabase } from '../lib/supabaseClient';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return undefined;
    }

    let active = true;
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      setHasRecoverySession(Boolean(data.session));
      setCheckingSession(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === 'PASSWORD_RECOVERY' && session) {
        setHasRecoverySession(true);
        setCheckingSession(false);
      }
    });

    checkSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (passwordStrength.score < 5) {
      setError('Please meet all password requirements before continuing.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please retype them exactly the same.');
      return;
    }

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

  const passwordForm = (
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

      <AuthField label="New password" htmlFor="password" icon={<KeyRound size={16} />}>
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          autoFocus
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (error) setError('');
          }}
          className="input-field pr-12 pl-11"
          placeholder="Choose a strong password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((previous) => !previous)}
          className="absolute inset-y-0 right-3 flex items-center text-foreground-muted transition-colors hover:text-foreground"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </AuthField>

      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((segment) => (
            <span
              key={segment}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                password && segment < passwordStrength.score ? passwordStrength.color : 'bg-border/60'
              }`}
            />
          ))}
          <span className="ml-1.5 text-xs font-semibold text-foreground-muted">
            {passwordStrength.label || 'Choose a password'}
          </span>
        </div>
        <ul className="grid gap-x-3 gap-y-1 text-xs text-foreground-muted sm:grid-cols-2">
          {PASSWORD_CHECKS.map(({ key, label }) => (
            <li key={key} className={passwordStrength.checks[key] ? 'text-success' : ''}>
              {passwordStrength.checks[key] ? '✓' : '○'} {label}
            </li>
          ))}
        </ul>
      </div>

      <AuthField label="Confirm new password" htmlFor="confirmPassword" icon={<KeyRound size={16} />}>
        <input
          id="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            if (error) setError('');
          }}
          className="input-field pr-12 pl-11"
          placeholder="Re-enter your new password"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((previous) => !previous)}
          className="absolute inset-y-0 right-3 flex items-center text-foreground-muted transition-colors hover:text-foreground"
          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </AuthField>

      <button
        type="submit"
        disabled={loading}
        className="btn-gradient inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating password...
          </>
        ) : (
          'Update password'
        )}
      </button>
    </form>
  );

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
        passwordForm
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
