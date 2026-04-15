// Shared label maps and date helpers used by every pickup-related email so the
// activity feed, in-app toasts, and emails all read consistently.

export const MATERIAL_LABELS = {
  metal: 'Metal',
  paper: 'Paper',
  electronics: 'Electronics',
  plastic: 'Plastic',
  pallets: 'Pallets',
  mixed: 'Mixed load',
};

export const TIME_WINDOW_LABELS = {
  morning: 'Morning (8am–12pm)',
  afternoon: 'Afternoon (12pm–5pm)',
  no_preference: 'No preference',
};

export function materialLabel(value) {
  return MATERIAL_LABELS[value] || value || '';
}

export function timeWindowLabel(value) {
  return TIME_WINDOW_LABELS[value] || value || '';
}

// Accepts an ISO date (YYYY-MM-DD) and returns "Tuesday, March 19".
// Builds the Date in local time to avoid TZ off-by-one bugs that would shift
// the displayed weekday.
export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
