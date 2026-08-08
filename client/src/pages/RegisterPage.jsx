import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  Eye,
  EyeOff,
  Hash,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import AuthField from '../components/auth/AuthField';
import { useAuth } from '../context/AuthContext';
import { fetchCampuses, verifyRegistrationOtp } from '../services/authApi';
import { CAMPUSES } from '../lib/campuses';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_SECONDS = 600;

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

  // 'form' | 'otp_verification' | 'success'
  const [step, setStep] = useState('form');

  const [form, setForm] = useState({
    name: '',
    contactInput: '', // Email OR Phone
    campus: '',
    sanUsn: '',
    password: '',
    confirmPassword: '',
  });

  const [detectedType, setDetectedType] = useState('email'); // 'email' | 'phone'
  const [campuses, setCampuses] = useState(CAMPUSES);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Phone OTP Verification State
  const [maskedPhone, setMaskedPhone] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [otpTimer, setOtpTimer] = useState(OTP_EXPIRY_SECONDS);
  const otpInputRefs = useRef([]);

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

  // Auto-detect Email vs Phone Mode
  useEffect(() => {
    const raw = form.contactInput.trim();
    if (!raw) {
      setDetectedType('email');
      return;
    }
    if (raw.includes('@')) {
      setDetectedType('email');
    } else if (/^[\d\s()+-]+$/.test(raw)) {
      setDetectedType('phone');
    }
  }, [form.contactInput]);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // OTP expiry timer
  useEffect(() => {
    if (step !== 'otp_verification' || otpTimer <= 0) return undefined;
    const timer = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [step, otpTimer]);

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

    const rawContact = form.contactInput.trim();
    if (!rawContact) {
      setError('Please enter your email address or phone number.');
      return;
    }

    const isEmailMode = rawContact.includes('@');

    if (isEmailMode) {
      if (!EMAIL_PATTERN.test(rawContact.toLowerCase())) {
        setError('Please enter a valid email address.');
        return;
      }
    } else {
      const digitsOnly = rawContact.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        setError('Please enter a valid phone number (e.g. +91 98765 43210).');
        return;
      }
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
      setError('Passwords do not match. Please retype them exactly.');
      return;
    }

    if (passwordStrength.score < 3) {
      setError('Please use a stronger password with uppercase letters, numbers, or symbols.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        campus: form.campus,
        sanUsn: form.sanUsn.trim().toUpperCase(),
        password: form.password,
      };

      if (isEmailMode) {
        payload.email = rawContact.toLowerCase();
      } else {
        payload.phone = rawContact;
      }

      const result = await register(payload);

      if (result.requiresOtp) {
        setMaskedPhone(result.maskedPhone || rawContact);
        setNormalizedPhone(result.phone || rawContact);
        setStep('otp_verification');
        setOtpDigits(['', '', '', '', '', '']);
        setOtpTimer(OTP_EXPIRY_SECONDS);
        setCooldown(COOLDOWN_SECONDS);
        toast.success('Verification code sent via SMS');
        return;
      }

      if (result.requiresEmailConfirmation) {
        setSuccess(
          result.message ||
            `Account created. Check ${rawContact.toLowerCase()} to confirm your email before signing in.`
        );
        toast.success('Check your email to finish signing up');
        return;
      }

      toast.success('Account created successfully');
      navigate('/');
    } catch (err) {
      const message = err?.message || 'Unable to create your account right now.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // OTP Inputs Handler
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

  // Verify Phone Registration OTP Submit
  const handleVerifyRegistrationOtp = async (event) => {
    if (event) event.preventDefault();
    setError('');

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyRegistrationOtp(normalizedPhone || form.contactInput, otpCode);
      if (res.token) {
        localStorage.setItem('campus_auth_token', res.token);
        localStorage.setItem('campus_auth_user', JSON.stringify(res.user));
      }
      toast.success('Phone verified & account activated successfully!');
      window.location.href = '/';
    } catch (verifyErr) {
      const msg = verifyErr?.message || 'Invalid verification code. Please try again.';
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
      eyebrow="Join the campus"
      title={
        step === 'otp_verification' ? (
          <>
            Verify your <span className="italic">phone.</span>
          </>
        ) : (
          <>
            Create your <span className="italic">account.</span>
          </>
        )
      }
      description={
        step === 'otp_verification'
          ? `Enter the 6-digit code sent to ${maskedPhone} to activate your account.`
          : 'A few details are all it takes to start navigating smarter.'
      }
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
      {/* STEP 1: INITIAL REGISTRATION FORM */}
      {step === 'form' && (
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

          <AuthField
            label={
              <div className="flex items-center justify-between">
                <span>Email or Phone Number</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted/80">
                  {detectedType === 'phone' ? 'Phone Mode' : 'Email Mode'}
                </span>
              </div>
            }
            htmlFor="contactInput"
            icon={detectedType === 'phone' ? <Phone size={16} /> : <Mail size={16} />}
          >
            <input
              id="contactInput"
              name="contactInput"
              type="text"
              autoComplete="username"
              required
              value={form.contactInput}
              onChange={handleChange}
              className="input-field pl-11"
              placeholder="you@campus.edu or +91 98765 43210"
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
                {detectedType === 'phone' ? 'Sending SMS Code...' : 'Creating Account...'}
              </>
            ) : detectedType === 'phone' ? (
              'Verify Phone via SMS'
            ) : (
              'Create account'
            )}
          </button>
        </form>
      )}

      {/* STEP 2: PHONE OTP VERIFICATION SCREEN */}
      {step === 'otp_verification' && (
        <form onSubmit={handleVerifyRegistrationOtp} className="auth-form space-y-4" noValidate>
          {error && (
            <div
              className="auth-error flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/10 px-4 py-3"
              role="alert"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" />
              <p className="text-sm font-medium text-error">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              6-Digit Registration Code
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
              Code expires in: <strong className="text-foreground">{formatTimer(otpTimer)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep('form');
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
                  Activating Account...
                </>
              ) : (
                'Activate & Sign In'
              )}
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}

export default RegisterPage;
