import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ob-bg)] p-6 text-[var(--ob-text)]">
      <div className="rounded-2xl border border-white/10 bg-[var(--ob-surface)] p-8 text-center shadow-2xl shadow-black/10">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-3 text-[var(--ob-text-muted)]">
          The page you requested could not be found.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
