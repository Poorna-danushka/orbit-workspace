import { AlertTriangle, ShieldAlert, WifiOff, Clock3 } from 'lucide-react';
import type { ApiError } from '@/lib/errors';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  error?: Partial<ApiError>;
}

export default function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Try again',
  error,
}: ErrorStateProps) {
  const status = error?.status ?? 0;
  const requestId = error?.requestId;

  let resolvedTitle = title ?? 'Something went wrong';
  let resolvedIcon = AlertTriangle;

  if (status === 403) {
    resolvedTitle = 'Access denied';
    resolvedIcon = ShieldAlert;
  } else if (status === 404) {
    resolvedTitle = 'Not found';
  } else if (status === 429) {
    resolvedTitle = 'Too many requests';
    resolvedIcon = Clock3;
  } else if (status >= 500 || error?.isServer || error?.isNetwork) {
    resolvedTitle = 'Server unavailable';
    resolvedIcon = WifiOff;
  }

  const Icon = resolvedIcon;

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-red-400" />
      </div>
      <h3
        className="text-lg font-bold text-[var(--ob-text)] mb-2"
        style={{ fontFamily: 'var(--ob-font-display)' }}
      >
        {resolvedTitle}
      </h3>
      <p className="text-sm text-[var(--ob-text-muted)] max-w-md mb-6">{message}</p>
      {requestId ? (
        <p className="mb-4 text-xs text-[var(--ob-text-muted)]">Reference: {requestId}</p>
      ) : null}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
