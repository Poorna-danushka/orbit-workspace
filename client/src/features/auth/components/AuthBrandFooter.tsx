type AuthBrandVariant = 'login' | 'register';

export default function AuthBrandFooter({ variant }: { variant: AuthBrandVariant }) {
  const isLogin = variant === 'login';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2,
        paddingTop: isLogin ? 20 : 18,
        borderTop: '1px solid var(--ob-auth-panel-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[...Array(5)].map((_, index) => (
            <span key={index} style={{ fontSize: 13, color: '#f59e0b' }}>
              ★
            </span>
          ))}
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--ob-auth-panel-muted)', fontWeight: 600 }}>
          {isLogin ? '4.9/5 from 10,000+ teams' : 'Rated 4.9/5 · 10k+ teams'}
        </span>
      </div>
      <span style={{ fontSize: '0.75rem', color: 'var(--ob-auth-panel-faint)', fontWeight: 500 }}>
        {isLogin ? 'Encrypted & Secure' : 'SOC2 Compliant'}
      </span>
    </div>
  );
}
