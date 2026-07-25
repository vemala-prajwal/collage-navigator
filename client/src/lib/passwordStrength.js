const STRENGTH_LEVELS = [
  { score: 0, label: '', color: 'bg-border' },
  { score: 1, label: 'Very weak', color: 'bg-red-500' },
  { score: 2, label: 'Weak', color: 'bg-orange-500' },
  { score: 3, label: 'Fair', color: 'bg-yellow-500' },
  { score: 4, label: 'Good', color: 'bg-lime-500' },
  { score: 5, label: 'Strong', color: 'bg-emerald-500' },
];

export function getPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const level = STRENGTH_LEVELS[score] || STRENGTH_LEVELS[0];

  return { score, label: level.label, color: level.color, checks };
}

export const PASSWORD_CHECKS = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'lowercase', label: 'One lowercase letter' },
  { key: 'uppercase', label: 'One uppercase letter' },
  { key: 'number', label: 'One number' },
  { key: 'special', label: 'One special character' },
];
