export function formatNumber(value: number | undefined): string {
  return typeof value === 'number' ? new Intl.NumberFormat().format(value) : '—';
}

export function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, options).format(date);
}

export function getInitials(value: string): string {
  return value.trim().slice(0, 1).toUpperCase() || '?';
}

const priorityClasses: Record<string, string> = {
  Urgent: 'priority-urgent',
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

export function getPriorityClass(priority: string): string {
  return priorityClasses[priority] ?? '';
}
