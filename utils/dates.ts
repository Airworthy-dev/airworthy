export function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function daysUntil(iso: string): number {
  const due = new Date(iso + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function urgencyFromDays(days: number): 'overdue' | 'soon' | 'upcoming' {
  if (days < 0) return 'overdue';
  if (days <= 14) return 'soon';
  return 'upcoming';
}

export function daysLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  return `${days}d away`;
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
