import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import AuthField from './AuthField';
import { PASSWORD_CHECKS, getPasswordStrength } from '../../lib/passwordStrength';

export default function SetNewPasswordForm({
  onSubmit,
  loading = false,
  error = '',
  onClearError,
  submitLabel = 'Update password',
  loadingLabel = 'Updating password...',
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const visibleError = error || localError;

  const clearErrors = () => {
    setLocalError('');
    if (onClearError) onClearError();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearErrors();

    if (passwordStrength.score < 5) {
      setLocalError('Please meet all password requirements before continuing.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please retype them exactly the same.');
      return;
    }

    await onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form space-y-3" noValidate>
      {visibleError && (
        <div
          className="auth-error flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/10 px-4 py-3"
          role="alert"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" />
          <p className="text-sm font-medium text-error">{visibleError}</p>
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
            if (visibleError) clearErrors();
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
              {passwordStrength.checks[key] ? 'Yes' : 'No'}: {label}
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
            if (visibleError) clearErrors();
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
            {loadingLabel}
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}

SetNewPasswordForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onClearError: PropTypes.func,
  submitLabel: PropTypes.string,
  loadingLabel: PropTypes.string,
};
