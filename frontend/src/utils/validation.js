// Centralized validation utilities
// Each validator returns an empty string when valid, otherwise an error message.

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const re = /[^\s@]+@[^\s@]+\.[^\s@]+/;
  return re.test(email) ? '' : 'Enter a valid email';
};

export const validatePassword = (pw, { min = 8 } = {}) => {
  if (!pw) return 'Password required';
  if (pw.length < min) return `At least ${min} characters`;
  return '';
};

export const validateName = (val, label = 'Name') => {
  if (!val) return `${label} required`;
  if (val.trim().length < 2) return `${label} too short`;
  if (val.length > 80) return `${label} too long`;
  return '';
};

export const validationSummary = (errorsObj) => {
  // Combine non-empty error strings for aria-live summary if needed
  return Object.values(errorsObj).filter(Boolean).join('. ');
};
