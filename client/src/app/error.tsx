'use client';

import Link from 'next/link';
import ErrorState from '@/components/ui/ErrorState';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ob-bg)] p-6 text-[var(--ob-text)]">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[var(--ob-surface)] p-8 shadow-2xl shadow-black/10">
        <ErrorState
          title="Something went wrong"
          message={error.message || 'An unexpected error occurred.'}
          onRetry={reset}
          retryLabel="Retry"
        />
        {error.digest ? <p className="mt-4 text-center text-xs text-[var(--ob-text-muted)]">Reference: {error.digest}</p> : null}
        <div className="mt-6 flex justify-center">
          <Link href="/" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--ob-text)] hover:bg-white/10">Go home</Link>
        </div>
      </div>
    </div>
  );
}
