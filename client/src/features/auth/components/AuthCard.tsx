import type { ReactNode } from 'react';

type AuthCardProps = {
  children: ReactNode;
  variant?: 'compact' | 'panel';
};

export default function AuthCard({ children, variant = 'compact' }: AuthCardProps) {
  if (variant === 'panel') {
    return (
      <div className="ob-auth-form-card" style={{ width: '100%', maxWidth: 410 }}>
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 440,
        background: 'var(--ob-surface)',
        border: '1px solid var(--ob-border-2)',
        borderRadius: 24,
        padding: '40px 36px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,110,255,0.10)',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: '20%',
          right: '20%',
          height: 1,
          background: 'linear-gradient(to right, transparent, rgba(124,110,255,0.7), transparent)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,110,255,0.15), transparent)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  );
}
