import type { ReactNode } from 'react';

type AuthPreviewVariant = 'login' | 'register';

export default function AuthPreviewFrame({
  variant,
  children,
}: {
  variant: AuthPreviewVariant;
  children: ReactNode;
}) {
  const isLogin = variant === 'login';

  return (
    <div
      style={{
        borderRadius: 20,
        padding: '22px 24px',
        background: 'var(--ob-auth-widget-bg)',
        boxShadow: 'var(--ob-shadow)',
        border: '1px solid var(--ob-auth-widget-border)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(30px)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -30,
          right: isLogin ? -30 : undefined,
          left: isLogin ? undefined : -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${isLogin ? 'var(--ob-cyan-glow)' : 'var(--ob-primary-glow)'} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  );
}
