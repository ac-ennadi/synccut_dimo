const UNITS: [limitSeconds: number, divisor: number, singular: string][] = [
  [60, 1, 'second'],
  [3600, 60, 'minute'],
  [86400, 3600, 'hour'],
  [604800, 86400, 'day'],
];

/**
 * Text for a feedback timestamp. Stored notes use ISO dates, but old rows and
 * seeded demo data can hold free text, which is passed through unchanged.
 */
export function formatRelativeTime(value: string | undefined | null, now: Date = new Date()): string {
  if (!value) return '';
  const text = value.trim();
  if (!text) return '';
  // A bare number or an ISO date is a real timestamp; anything else is display text.
  const parsed = /^\d{4}-\d{2}-\d{2}T/.test(text) ? new Date(text) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return text;

  const seconds = Math.round((now.getTime() - parsed.getTime()) / 1000);
  if (seconds < 45) return 'Just now';
  for (const [limit, divisor, unit] of UNITS) {
    if (seconds < limit) {
      const count = Math.max(1, Math.round(seconds / divisor));
      return `${count} ${unit}${count === 1 ? '' : 's'} ago`;
    }
  }
  // Older than a week: an absolute date is more useful than "5 weeks ago".
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: parsed.getFullYear() === now.getFullYear() ? undefined : 'numeric',
    timeZone: 'UTC',
  });
}
