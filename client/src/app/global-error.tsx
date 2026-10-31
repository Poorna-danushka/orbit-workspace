'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: '#0b1020',
            color: '#f8fafc',
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 560,
              width: '100%',
              textAlign: 'center',
              padding: 32,
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(15,23,42,0.9)',
            }}
          >
            <h2 style={{ fontSize: 28, marginBottom: 12 }}>Something went wrong</h2>
            <p style={{ color: '#cbd5e1', marginBottom: 20 }}>
              {error.message || 'An unexpected error occurred.'}
            </p>
            {error.digest ? (
              <p style={{ color: '#94a3b8', fontSize: 12 }}>Reference: {error.digest}</p>
            ) : null}
            <button
              type="button"
              onClick={() => reset()}
              style={{
                marginTop: 20,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 18px',
                background: 'rgba(255,255,255,0.04)',
                color: '#f8fafc',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
