const DAY_MS = 24 * 60 * 60 * 1000;

export function agoLabel(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

export function isStale(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() > 14 * DAY_MS;
}
