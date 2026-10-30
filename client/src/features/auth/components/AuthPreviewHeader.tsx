import { Layers, Rocket } from 'lucide-react';

type AuthPreviewVariant = 'login' | 'register';

export default function AuthPreviewHeader({ variant }: { variant: AuthPreviewVariant }) {
  const isLogin = variant === 'login';
  const accent = isLogin ? 'var(--ob-primary)' : 'var(--ob-cyan)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 14,
        borderBottom: '1px solid var(--ob-auth-widget-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'var(--ob-auth-widget-card-bg)',
            border: '1px solid var(--ob-auth-widget-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
          }}
        >
          {isLogin ? <Layers size={16} /> : <Rocket size={16} />}
        </div>
        <div>
          <p
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: 'var(--ob-auth-panel-text)',
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: isLogin ? '-0.01em' : undefined,
            }}
          >
            {isLogin ? 'Q4 Product Sprint' : 'Free Tier Workspace'}
          </p>
          <p
            style={{
              fontSize: 10,
              color: 'var(--ob-auth-panel-muted)',
              display: isLogin ? 'flex' : undefined,
              alignItems: isLogin ? 'center' : undefined,
              gap: isLogin ? 4 : undefined,
            }}
          >
            {isLogin ? (
              <>
                <span>12 Active Tasks</span> • <span>4 Teammates</span>
              </>
            ) : (
              'Instant Setup • No Credit Card'
            )}
          </p>
        </div>
      </div>

      {isLogin ? (
        <span
          style={{
            fontSize: 10,
            background: 'rgba(34,211,160,0.12)',
            color: 'var(--ob-success)',
            border: '1px solid rgba(34,211,160,0.25)',
            padding: '4px 10px',
            borderRadius: 99,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--ob-success)',
              animation: 'pulse-ring 2s infinite',
            }}
          />
          ON TRACK
        </span>
      ) : (
        <span
          style={{
            fontSize: 10,
            background: 'var(--ob-auth-widget-card-bg)',
            color: accent,
            border: '1px solid var(--ob-auth-widget-border)',
            padding: '4px 10px',
            borderRadius: 99,
            fontWeight: 700,
          }}
        >
          UNLIMITED
        </span>
      )}
    </div>
  );
}
