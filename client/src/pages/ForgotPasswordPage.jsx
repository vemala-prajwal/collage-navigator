import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Phone,
} from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import AuthField from '../components/auth/AuthField';
import { PASSWORD_CHECKS, getPasswordStrength } from '../lib/passwordStrength';
import {
  requestPasswordReset,
  requestPhonePasswordReset,
  resetPasswordWithToken,
  verifyPhoneOtp,
} from '../services/authApi';
import { sendPhoneOtp, confirmPhoneOtp, normalizePhoneNumber } from '../lib/firebase';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_SECONDS = 600; // 10 minutes

function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Steps: 'request' | 'email_sent' | 'otp_verify' | 'new_password' | 'reset_success'
  const [step, setStep] = useState('request');

  // Input states
  const [identifier, setIdentifier] = useState('');
  const [detectedType, setDetectedType] = useState('email'); // 'email' | 'phone'

  // Phone OTP state
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [otpTimer, setOtpTimer] = useState(OTP_EXPIRY_SECONDS);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const otpInputRefs = useRef([]);

  // Gated Reset Token after successful OTP
  const [resetToken, setResetToken] = useState('');

  // Password reset states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Common UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect Email vs Phone Mode as user types
  useEffect(() => {
    const raw = identifier.trim();
    if (!raw) {
      setDetectedType('email');
      return;
    }
    if (raw.includes('@')) {
      setDetectedType('email');
    } else if (/^[\d\s()+-]+$/.test(raw)) {
      setDetectedType('phone');
    }
  }, [identifier]);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // OTP expiry timer
  useEffect(() => {
    if (step !== 'otp_verify' || otpTimer <= 0) return undefined;
    const timer = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [step, otpTimer]);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  // ── Step 1 Submit: Request Reset (Email or Phone) ─────────────────────────
  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const rawInput = identifier.trim();
    if (!rawInput) {
      setError('Please enter your email address or phone number.');
      return;
    }

    const isEmail = rawInput.includes('@');

    if (isEmail) {
      if (!EMAIL_PATTERN.test(rawInput.toLowerCase())) {
        setError('Please enter a valid email address.');
        return;
      }
    } else {
      const digitsOnly = rawInput.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        setError('Please enter a valid phone number (e.g. +91 98765 43210).');
        return;
      }
    }

    setLoading(true);

    try {
      if (isEmail) {
        await requestPasswordReset(rawInput.toLowerCase());
        setStep('email_sent');
        toast.success('Reset link sent to your email');
      } else {
        const res = await requestPhonePasswordReset(rawInput);
        const normalized = normalizePhoneNumber(rawInput);
        try {
          const confirmation = await sendPhoneOtp(normalized);
          setConfirmationResult(confirmation);
        } catch (sendError) {
          setError('Unable to send SMS verification. Please try again.');
          setLoading(false);
          return;
        }
        setNormalizedPhone(normalized);
        setMaskedPhone(res.maskedPhone || rawInput);
        setStep('otp_verify');
        setOtpDigits(['', '', '', '', '', '']);
        setOtpTimer(OTP_EXPIRY_SECONDS);
        setCooldown(COOLDOWN_SECONDS);
        setRemainingAttempts(null);
        toast.success('Verification code sent via SMS');
      }
    } catch (err) {
      const msg = err?.message || 'Unable to request password reset. Please try again.';
      setError(msg);
      if (err?.retryAfterSeconds) {
        setCooldown(err.retryAfterSeconds);
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend Phone OTP ───────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError('');
    setLoading(true);

    try {
      const confirmation = await sendPhoneOtp(normalizedPhone);
      setConfirmationResult(confirmation);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(OTP_EXPIRY_SECONDS);
      setCooldown(COOLDOWN_SECONDS);
      setRemainingAttempts(null);
      toast.success('New verification code sent via SMS');
    } catch (err) {
      const msg = err?.message || 'Unable to resend verification code.';
      setError(msg);
      if (err?.retryAfterSeconds) {
        setCooldown(err.retryAfterSeconds);
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 OTP Digits Handlers ─────────────────────────────────────────────
  const handleOtpDigitChange = (index, value) => {
    const cleanDigit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanDigit;
    setOtpDigits(newDigits);
    if (error) setError('');

    if (cleanDigit && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      if (otpInputRefs.current[5]) otpInputRefs.current[5].focus();
    }
  };

  // ── Step 2 Submit: Verify Phone OTP ───────────────────────────────────────
  const handleVerifyOtpSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    if (!confirmationResult) {
      setError('Unable to verify code. Please request a new SMS code.');
      return;
    }

    if (otpTimer <= 0) {
      setError('Verification code has expired. Please request a new code.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await confirmPhoneOtp(confirmationResult, code);
      const firebaseToken = await userCredential.user.getIdToken();
      const res = await verifyPhoneOtp(normalizedPhone, code, firebaseToken);
      if (!res?.resetToken) {
        throw new Error('Verification failed. Please try requesting a new code.');
      }
      setResetToken(res.resetToken);
      setStep('new_password');
      toast.success('Code verified! Enter your new password.');
    } catch (err) {
      const msg = err?.message || 'Incorrect verification code.';
      setError(msg);
      if (err?.remainingAttempts !== undefined) {
        setRemainingAttempts(err.remainingAttempts);
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3 Submit: Reset Password with Token ──────────────────────────────
  const handleResetPasswordSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (passwordStrength.score < 5) {
      setError('Please meet all password requirements before continuing.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please retype them exactly.');
      return;
    }

    if (!resetToken) {
      setError('Reset session expired. Please start the process again.');
      return;
    }

    setLoading(true);

    try {
      await resetPasswordWithToken(resetToken, password);
      setStep('reset_success');
      toast.success('Password updated successfully!');
    } catch (err) {
      const msg = err?.message || 'Failed to update password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title={
        step === 'email_sent' ? (
          <>
            Check your <span className="italic">inbox.</span>
          </>
        ) : step === 'otp_verify' ? (
          <>
            Enter SMS <span className="italic">code.</span>
          </>
        ) : step === 'new_password' ? (
          <>
            Set new <span className="italic">password.</span>
          </>
        ) : step === 'reset_success' ? (
          <>
            Password <span className="italic">updated!</span>
          </>
        ) : (
          <>
            Reset your <span className="italic">password.</span>
          </>
        )
      }
      description={
        step === 'email_sent'
          ? `We sent password reset instructions to ${identifier.trim().toLowerCase()}.`
          : step === 'otp_verify'
          ? `We sent a 6-digit code to ${maskedPhone}.`
          : step === 'new_password'
          ? 'Enter and confirm your new secure password below.'
          : step === 'reset_success'
          ? 'Your password has been changed. Sign in with your new password.'
          : "Enter your registered email address or phone number and we'll help you reset your password."
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
      {/* ── STEP 1: INITIAL REQUEST FORM (EMAIL OR PHONE) ───────────────── */}
      {step === 'request' && (
        <form onSubmit={handleRequestSubmit} className="auth-form space-y-3" noValidate>
          {error && (
            <div
              className="auth-error flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/10 px-4 py-3"
              role="alert"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" />
              <p className="text-sm font-medium text-error">{error}</p>
            </div>
          )}

          <AuthField
            label={
              <div className="flex items-center justify-between">
                <span>Email or Phone Number</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted/80">
                  {detectedType === 'phone' ? 'SMS Code Mode' : 'Email Link Mode'}
                </span>
              </div>
            }
            htmlFor="identifier"
            icon={detectedType === 'phone' ? <Phone size={16} /> : <Mail size={16} />}
          >
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              required
              autoFocus
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (error) setError('');
              }}
              className="input-field pl-11"
              placeholder="you@campus.edu or +91 98765 43210"
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
                {detectedType === 'phone' ? 'Sending SMS Code...' : 'Sending Link...'}
              </>
            ) : detectedType === 'phone' ? (
              'Send SMS Reset Code'
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      )}

      {/* ── STEP 1B: EMAIL SENT SUCCESS SCREEN ────────────────────────────── */}
      {step === 'email_sent' && (
        <div className="space-y-4">
          <div
            className="flex items-start gap-2.5 rounded-xl border border-success/25 bg-success/10 px-4 py-3"
            role="status"
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
            <p className="text-sm leading-relaxed text-success">
              Check your inbox for a password reset email. If it doesn't arrive within a few minutes, check your spam folder.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setStep('request')}
            className="inline-flex w-full items-center justify-center rounded-xl border border-border/80 bg-surface-secondary/80 px-4 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
          >
            Try another email or phone
          </button>
        </div>
      )}

      {/* ── STEP 2: PHONE OTP VERIFICATION SCREEN ───────────────────────── */}
      {step === 'otp_verify' && (
        <form onSubmit={handleVerifyOtpSubmit} className="auth-form space-y-4" noValidate>
          {error && (
            <div
              className="auth-error flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/10 px-4 py-3"
              role="alert"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" />
              <div>
                <p className="text-sm font-medium text-error">{error}</p>
                {remainingAttempts !== null && remainingAttempts > 0 && (
                  <p className="mt-0.5 text-xs text-error/80">
                    {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining before code invalidates.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              6-Digit Reset Code
            </label>

            <div className="flex items-center justify-between gap-2" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="h-12 w-11 rounded-xl border border-border/80 bg-surface-secondary/80 text-center text-lg font-bold text-foreground transition-all focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              Expires in: <strong className="text-foreground">{formatTimer(otpTimer)}</strong>
            </span>

            <button
              type="button"
              disabled={cooldown > 0 || loading}
              onClick={handleResendOtp}
              className="font-semibold text-accent transition-colors hover:text-accent-strong disabled:cursor-not-allowed disabled:text-muted"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep('request');
                setError('');
              }}
              className="inline-flex items-center justify-center rounded-xl border border-border/70 bg-surface-secondary/70 p-3.5 text-foreground transition-colors hover:bg-surface"
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>

            <button
              type="submit"
              disabled={loading || otpDigits.join('').length !== 6}
              className="btn-gradient inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 3: NEW PASSWORD FORM (GATED BY PHONE OTP TOKEN) ─────────── */}
      {step === 'new_password' && (
        <form onSubmit={handleResetPasswordSubmit} className="auth-form space-y-3" noValidate>
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
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="input-field pr-12 pl-11"
              placeholder="Choose a strong password"
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

          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((segment) => (
                <span
                  key={segment}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    password && segment < passwordStrength.score
                      ? passwordStrength.color
                      : 'bg-border/60'
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

          <AuthField
            label="Confirm new password"
            htmlFor="confirmPassword"
            icon={<KeyRound size={16} />}
          >
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              className="input-field pr-12 pl-11"
              placeholder="Re-enter your new password"
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
      )}

      {/* ── STEP 4: RESET SUCCESS SCREEN ───────────────────────────────────── */}
      {step === 'reset_success' && (
        <div className="space-y-4">
          <div
            className="flex items-start gap-2.5 rounded-xl border border-success/25 bg-success/10 px-4 py-3"
            role="status"
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
            <p className="text-sm leading-relaxed text-success">
              Your password has been changed successfully. You can now sign in with your new password.
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
      )}
    </AuthShell>
  );
}

export default ForgotPasswordPage;
