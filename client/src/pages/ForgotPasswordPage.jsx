import { useEffect, useRef, useState } from 'react';
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
  Lock,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import AuthField from '../components/auth/AuthField';
import {
  requestPasswordReset as apiRequestEmailReset,
  requestPhonePasswordReset as apiRequestPhoneReset,
  resetPasswordWithToken as apiResetPasswordWithToken,
  verifyPhoneOtp as apiVerifyPhoneOtp,
} from '../services/authApi';
import { supabase } from '../lib/supabaseClient';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{7,14}$/;
const COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_SECONDS = 600; // 10 minutes

function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Multi-step flow state: 'input' | 'email_sent' | 'otp_verification' | 'new_password' | 'success'
  const [step, setStep] = useState('input');

  // Input state
  const [inputVal, setInputVal] = useState('');
  const [detectedType, setDetectedType] = useState('email'); // 'email' | 'phone'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Phone OTP Flow State
  const [maskedPhone, setMaskedPhone] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(OTP_EXPIRY_SECONDS);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [resetToken, setResetToken] = useState('');
  const otpInputRefs = useRef([]);

  // New Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Auto-detect input type (email or phone) as the user types
  useEffect(() => {
    const raw = inputVal.trim();
    if (!raw) {
      setDetectedType('email');
      return;
    }

    if (raw.includes('@')) {
      setDetectedType('email');
    } else if (/^[\d\s()+-]+$/.test(raw)) {
      setDetectedType('phone');
    }
  }, [inputVal]);

  // Cooldown timer (60 seconds)
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // OTP expiry countdown timer (10 minutes)
  useEffect(() => {
    if (step !== 'otp_verification' || otpTimer <= 0) return undefined;
    const timer = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, otpTimer]);

  // Step 1 Submit: Combined Email / Phone submit handler
  const handleInitialSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const raw = inputVal.trim();

    if (!raw) {
      setError('Please enter your email address or phone number.');
      return;
    }

    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another code.`);
      return;
    }

    // Determine type
    const isEmail = raw.includes('@');
    const digitsOnly = raw.replace(/\D/g, '');

    if (isEmail) {
      const normalizedEmail = raw.toLowerCase();
      if (!EMAIL_PATTERN.test(normalizedEmail)) {
        setError('Please enter a valid email address.');
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
      let retryAfterSeconds = null;

      try {
        await apiRequestEmailReset(normalizedEmail, targetRedirectTo);
        success = true;
      } catch (apiErr) {
        const errText = apiErr?.message || '';
        retryAfterSeconds = apiErr?.retryAfterSeconds ?? null;

        const isRateLimitErr = retryAfterSeconds != null || /rate.?limit|too.?many/i.test(errText);

        if (!isRateLimitErr && supabase) {
          try {
            const { error: sbErr } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
              redirectTo: targetRedirectTo,
            });
            if (!sbErr) {
              success = true;
            } else {
              errorMessage = sbErr.message || 'Could not send reset link. Please try again.';
            }
          } catch (sbThrown) {
            errorMessage = sbThrown?.message || 'Could not send reset link. Please try again.';
          }
        } else {
          errorMessage = retryAfterSeconds
            ? `Please wait ${retryAfterSeconds} seconds before requesting another link.`
            : errText || 'Could not send reset link. Please try again.';
        }
      }

      setLoading(false);

      if (success) {
        setStep('email_sent');
        setCooldown(COOLDOWN_SECONDS);
        toast.success('Reset link sent');
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } else {
      // Phone Flow
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        setError('Please enter a valid phone number (e.g. +1 234 567 8900).');
        return;
      }

      setLoading(true);
      try {
        const res = await apiRequestPhoneReset(raw);
        setMaskedPhone(res.maskedPhone || raw);
        setNormalizedPhone(res.phone || raw);
        setStep('otp_verification');
        setOtpDigits(['', '', '', '', '', '']);
        setOtpTimer(OTP_EXPIRY_SECONDS);
        setCooldown(COOLDOWN_SECONDS);
        toast.success('Verification code sent via SMS');
      } catch (phoneErr) {
        const msg = phoneErr?.message || 'Could not send verification code. Please try again.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  // Step 2: Handle OTP Digit Input Box Changes
  const handleOtpDigitChange = (index, value) => {
    const cleanDigit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanDigit;
    setOtpDigits(newDigits);
    if (error) setError('');

    // Auto-advance focus to next digit box
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
      const digits = pasted.split('');
      setOtpDigits(digits);
      if (otpInputRefs.current[5]) otpInputRefs.current[5].focus();
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (event) => {
    if (event) event.preventDefault();
    setError('');

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiVerifyPhoneOtp(normalizedPhone || inputVal, otpCode);
      setResetToken(res.resetToken);
      setStep('new_password');
      toast.success('Code verified successfully');
    } catch (verifyErr) {
      const msg = verifyErr?.message || 'Invalid verification code.';
      setError(msg);
      if (verifyErr?.remainingAttempts != null) {
        setRemainingAttempts(verifyErr.remainingAttempts);
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await apiRequestPhoneReset(normalizedPhone || inputVal);
      setMaskedPhone(res.maskedPhone || inputVal);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(OTP_EXPIRY_SECONDS);
      setCooldown(COOLDOWN_SECONDS);
      setRemainingAttempts(null);
      toast.success('New verification code sent!');
    } catch (err) {
      const msg = err?.message || 'Failed to resend code.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3 Submit: Password Reset Submit Handler
  const handlePasswordResetSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiResetPasswordWithToken(resetToken, newPassword);
      setStep('success');
      toast.success('Password updated successfully');
    } catch (resetErr) {
      const msg = resetErr?.message || 'Could not update password. Please try again.';
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
        step === 'new_password' ? (
          <>
            Set new <span className="italic">password</span>
          </>
        ) : (
          <>
            Forgot your <span className="italic">password?</span>
          </>
        )
      }
      description={
        step === 'otp_verification'
          ? `Enter the 6-digit code sent to ${maskedPhone || 'your phone'}`
          : step === 'new_password'
          ? 'Enter your new secure password below.'
          : 'Enter your registered email address or phone number to reset your password.'
      }
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
      {/* STEP 1: SUCCESS BANNER FOR EMAIL */}
      {step === 'email_sent' && (
        <div className="space-y-3">
          <div
            className="flex items-start gap-2.5 rounded-xl border border-success/25 bg-success/10 px-4 py-3"
            role="status"
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
            <p className="text-sm leading-relaxed text-success">
              If an account exists for <strong>{inputVal.trim().toLowerCase()}</strong>, you&apos;ll receive a
              password reset link shortly. Check your spam folder if it does not arrive.
            </p>
          </div>

          <button
            type="button"
            disabled={cooldown > 0}
            onClick={() => setStep('input')}
            className="inline-flex w-full items-center justify-center rounded-xl border border-border/70 bg-surface-secondary/70 px-4 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Send another link'}
          </button>
        </div>
      )}

      {/* STEP 1: INITIAL COMBINED INPUT FORM */}
      {step === 'input' && (
        <form onSubmit={handleInitialSubmit} className="auth-form space-y-3" noValidate>
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
                  {detectedType === 'phone' ? 'Phone Mode' : 'Email Mode'}
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
              value={inputVal}
              onChange={(event) => {
                setInputVal(event.target.value);
                if (error) setError('');
              }}
              className="input-field pl-11"
              placeholder="you@campus.edu or +1 234 567 8900"
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
                {detectedType === 'phone' ? 'Sending SMS Code...' : 'Sending Reset Link...'}
              </>
            ) : cooldown > 0 ? (
              `Please wait ${cooldown}s`
            ) : detectedType === 'phone' ? (
              'Send SMS Code'
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      )}

      {/* STEP 2: OTP VERIFICATION SCREEN (PHONE FLOW) */}
      {step === 'otp_verification' && (
        <form onSubmit={handleVerifyOtp} className="auth-form space-y-4" noValidate>
          {error && (
            <div
              className="auth-error flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/10 px-4 py-3"
              role="alert"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" />
              <div>
                <p className="text-sm font-medium text-error">{error}</p>
                {remainingAttempts != null && (
                  <p className="mt-1 text-xs text-error/80">{remainingAttempts} attempts remaining</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              6-Digit Verification Code
            </label>

            {/* 6 Digit Input Boxes */}
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
              Code expires in: <strong className="text-foreground">{formatTimer(otpTimer)}</strong>
            </span>

            <button
              type="button"
              disabled={cooldown > 0 || loading}
              onClick={handleResendOtp}
              className="font-semibold text-accent transition-colors hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend Code'}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep('input');
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
                  Verifying Code...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: NEW PASSWORD SCREEN (PHONE FLOW) */}
      {step === 'new_password' && (
        <form onSubmit={handlePasswordResetSubmit} className="auth-form space-y-3" noValidate>
          {error && (
            <div
              className="auth-error flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/10 px-4 py-3"
              role="alert"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" />
              <p className="text-sm font-medium text-error">{error}</p>
            </div>
          )}

          <AuthField label="New Password" htmlFor="newPassword" icon={<Lock size={16} />}>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                className="input-field pl-11 pr-11"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </AuthField>

          <AuthField label="Confirm New Password" htmlFor="confirmPassword" icon={<KeyRound size={16} />}>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              className="input-field pl-11"
              placeholder="Re-enter new password"
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
                Updating Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      )}

      {/* STEP 4: SUCCESS BANNER */}
      {step === 'success' && (
        <div className="space-y-4">
          <div
            className="flex items-start gap-2.5 rounded-xl border border-success/25 bg-success/10 px-4 py-3.5"
            role="status"
          >
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-success" />
            <div>
              <h4 className="font-semibold text-success">Password Reset Successful!</h4>
              <p className="mt-0.5 text-xs text-success/80 leading-relaxed">
                Your account password has been updated successfully. You can now log in with your new password.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-gradient inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold"
          >
            Proceed to Sign In
          </button>
        </div>
      )}
    </AuthShell>
  );
}

export default ForgotPasswordPage;
