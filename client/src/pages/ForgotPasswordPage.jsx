import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Mail, Phone } from 'lucide-react';
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

  const [step, setStep] = useState('request'); // request | email_sent | otp_verify | new_password | reset_success

  const [identifier, setIdentifier] = useState('');
  const [detectedType, setDetectedType] = useState('email'); // 'email' | 'phone'

  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  const [cooldown, setCooldown] = useState(0);
  const [otpTimer, setOtpTimer] = useState(OTP_EXPIRY_SECONDS);
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  const [resetToken, setResetToken] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = identifier.trim();
    if (!raw) return setDetectedType('email');
    if (raw.includes('@')) setDetectedType('email');
    else if (/^[\d\s()+-]+$/.test(raw)) setDetectedType('phone');
  }, [identifier]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if (step !== 'otp_verify' || otpTimer <= 0) return undefined;
    const t = setInterval(() => setOtpTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [step, otpTimer]);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const raw = identifier.trim();
    if (!raw) return setError('Please enter your email address or phone number.');

    const isEmail = raw.includes('@');
    if (isEmail) {
      if (!EMAIL_PATTERN.test(raw.toLowerCase())) return setError('Please enter a valid email address.');
    } else {
      const digits = raw.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) return setError('Please enter a valid phone number.');
    }

    setLoading(true);
    try {
      if (isEmail) {
        await requestPasswordReset(raw.toLowerCase());
        setStep('email_sent');
        setCooldown(COOLDOWN_SECONDS);
        toast.success('Reset link sent');
      } else {
        const res = await requestPhonePasswordReset(raw);
        const normalized = normalizePhoneNumber(raw);
        const confirmation = await sendPhoneOtp(normalized);
        setConfirmationResult(confirmation);
        setNormalizedPhone(normalized);
        setMaskedPhone(res.maskedPhone || raw);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpTimer(OTP_EXPIRY_SECONDS);
        setCooldown(COOLDOWN_SECONDS);
        setRemainingAttempts(null);
        setStep('otp_verify');
        toast.success('Verification code sent via SMS');
      }
    } catch (err) {
      const msg = err?.message || 'Unable to request password reset.';
      setError(msg);
      if (err?.retryAfterSeconds) setCooldown(err.retryAfterSeconds);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
      toast.success('New verification code sent');
    } catch (err) {
      const msg = err?.message || 'Unable to resend verification code.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    const d = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = d;
    setOtpDigits(next);
    if (d && otpInputRefs.current[index + 1]) otpInputRefs.current[index + 1].focus();
    if (error) setError('');
  };

  const handleOtpPaste = (ev) => {
    ev.preventDefault();
    const pasted = ev.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      if (otpInputRefs.current[5]) otpInputRefs.current[5].focus();
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const code = otpDigits.join('');
    if (code.length !== 6) return setError('Please enter all 6 digits of your verification code.');
    if (!confirmationResult) return setError('Unable to verify code. Please request a new SMS code.');
    if (otpTimer <= 0) return setError('Verification code has expired. Please request a new code.');

    setLoading(true);
    try {
      const userCredential = await confirmPhoneOtp(confirmationResult, code);
      const firebaseToken = await userCredential.user.getIdToken();
      const res = await verifyPhoneOtp(normalizedPhone, code, firebaseToken);
      if (!res?.resetToken) throw new Error('Verification failed.');
      setResetToken(res.resetToken);
      setStep('new_password');
      toast.success('Code verified');
    } catch (err) {
      const msg = err?.message || 'Incorrect verification code.';
      setError(msg);
      if (err?.remainingAttempts !== undefined) setRemainingAttempts(err.remainingAttempts);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (passwordStrength.score < 5) return setError('Please meet all password requirements.');
    if (!resetToken) return setError('Reset session expired. Please start again.');

    setLoading(true);
    try {
      await resetPasswordWithToken(resetToken, password);
      setStep('reset_success');
      toast.success('Password updated successfully');
    } catch (err) {
      const msg = err?.message || 'Failed to update password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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
            Set new <span className="italic">password</span>
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
          ? `We sent reset instructions to ${identifier.trim().toLowerCase()}`
          : step === 'otp_verify'
          ? `Enter the 6-digit code sent to ${maskedPhone}`
          : step === 'new_password'
          ? 'Enter and confirm your new secure password below.'
          : step === 'reset_success'
          ? 'Your password was updated. Sign in with the new password.'
          : "Enter your registered email address or phone number to reset your password."
      }
      footer={
        <p>
          <Link to="/login" className="font-semibold text-accent transition-colors hover:text-accent-strong">
            Back to sign in
          </Link>
        </p>
      }
    >
      {/* Email sent banner */}
      {step === 'email_sent' && (
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 rounded-xl border border-success/25 bg-success/10 px-4 py-3" role="status">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
            <p className="text-sm leading-relaxed text-success">
              If an account exists for <strong>{identifier.trim().toLowerCase()}</strong>, you'll receive a reset link shortly.
            </p>
          </div>

          <button type="button" disabled={cooldown > 0} onClick={() => setStep('request')} className="inline-flex w-full items-center justify-center rounded-xl border border-border/70 bg-surface-secondary/70 px-4 py-3.5 text-sm font-semibold">
            {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Send another link'}
          </button>
        </div>
      )}

      {/* Request form */}
      {step === 'request' && (
        <form onSubmit={handleRequestSubmit} className="auth-form space-y-3" noValidate>
          {error && (
            <div className="auth-error flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/10 px-4 py-3" role="alert">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" />
              <p className="text-sm font-medium text-error">{error}</p>
            </div>
          )}

          <AuthField
            label={<div className="flex items-center justify-between"><span>Email or Phone Number</span><span className="text-xs font-semibold uppercase tracking-wider text-muted/80">{detectedType === 'phone' ? 'SMS Code Mode' : 'Email Link Mode'}</span></div>}
            htmlFor="identifier"
            icon={detectedType === 'phone' ? <Phone size={16} /> : <Mail size={16} />}
          >
            <input id="identifier" type="text" autoComplete="username" required autoFocus value={identifier} onChange={(ev) => { setIdentifier(ev.target.value); if (error) setError(''); }} className="input-field pl-11" placeholder="you@campus.edu or +1 234 567 8900" />
          </AuthField>

          <button type="submit" disabled={loading || cooldown > 0} className="btn-gradient inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold">
            {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{detectedType === 'phone' ? 'Sending SMS Code...' : 'Sending Reset Link...'}</>) : cooldown > 0 ? (`Please wait ${cooldown}s`) : detectedType === 'phone' ? 'Send SMS Code' : 'Send Reset Link'}
          </button>
        </form>
      )}

      {/* OTP verify */}
      {step === 'otp_verify' && (
        <form onSubmit={handleVerifyOtpSubmit} className="auth-form space-y-4" noValidate onPaste={handleOtpPaste}>
          {error && (
            <div className="auth-error flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/10 px-4 py-3" role="alert">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" />
              <div>
                <p className="text-sm font-medium text-error">{error}</p>
                {remainingAttempts != null && <p className="mt-1 text-xs text-error/80">{remainingAttempts} attempts remaining</p>}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">6-Digit Verification Code</label>
            <div className="flex items-center justify-between gap-2">
              {otpDigits.map((d, i) => (
                <input key={i} ref={(el) => (otpInputRefs.current[i] = el)} type="text" inputMode="numeric" maxLength={1} value={d} onChange={(e) => handleOtpDigitChange(i, e.target.value)} className="h-12 w-11 rounded-xl border border-border/80 bg-surface-secondary/80 text-center text-lg font-bold" />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>Code expires in: <strong className="text-foreground">{formatTimer(otpTimer)}</strong></span>
            <button type="button" disabled={cooldown > 0 || loading} onClick={handleResendOtp} className="font-semibold text-accent">{cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend Code'}</button>
          </div>

          <button type="submit" className="btn-gradient inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold">Verify Code</button>
        </form>
      )}

      {/* New password */}
      {step === 'new_password' && (
        <form onSubmit={handleResetPasswordSubmit} className="auth-form space-y-4" noValidate>
          {error && (<div className="auth-error flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/10 px-4 py-3" role="alert"><AlertCircle size={16} className="mt-0.5 shrink-0 text-error" /><p className="text-sm font-medium text-error">{error}</p></div>)}

          <AuthField label={<span>New Password</span>} htmlFor="password" icon={<KeyRound size={16} />}>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-11" placeholder="Choose a secure password" />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </AuthField>

          <AuthField label={<span>Confirm Password</span>} htmlFor="confirmPassword" icon={<KeyRound size={16} />}>
            <div className="relative">
              <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field pl-11" placeholder="Retype new password" />
              <button type="button" onClick={() => setShowConfirmPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2">{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </AuthField>

          <div className="space-y-2">
            {PASSWORD_CHECKS.map((chk) => (
              <div key={chk.key} className={`text-sm ${passwordStrength[chk.key] ? 'text-success' : 'text-muted'}`}>{chk.label}</div>
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-gradient inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set New Password'}</button>
        </form>
      )}

      {step === 'reset_success' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-success/25 bg-success/10 px-4 py-3">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
            <p className="text-sm leading-relaxed text-success">Your password was updated. You can now sign in with your new password.</p>
          </div>
          <button onClick={() => navigate('/login')} className="btn-gradient inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold">Back to Sign In</button>
        </div>
      )}
    </AuthShell>
  );
}

export default ForgotPasswordPage;
