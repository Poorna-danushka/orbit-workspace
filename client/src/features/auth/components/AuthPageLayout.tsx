import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import OrbitIcon from '@/components/ui/OrbitIcon';
import { ROUTES } from '@/lib/constants/routes';

type AuthPageLayoutProps = {
  children: ReactNode;
  variant: 'forgot' | 'reset';
};

export default function AuthPageLayout({ children, variant }: AuthPageLayoutProps) {
  const isReset = variant === 'reset';

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--ob-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '10%',
          ...(isReset ? { right: '-10%' } : { left: '-10%' }),
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,110,255,0.14) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: '10%',
          ...(isReset ? { left: '-10%' } : { right: '-10%' }),
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: isReset
            ? 'radial-gradient(circle, rgba(6,214,247,0.10) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid var(--ob-border)',
          background: 'rgba(7,8,15,0.7)',
          backdropFilter: 'blur(20px)',
          zIndex: 50,
        }}
      >
        <Link
          href={ROUTES.home}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            color: 'var(--ob-text)',
          }}
        >
          <div style={{ color: 'var(--ob-primary)' }}>
            <OrbitIcon size={24} />
          </div>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--ob-text)',
            }}
          >
            Orbit <span style={{ color: 'var(--ob-primary)' }}>Workspace</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle compact />
          <Link
            href={ROUTES.login}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 10,
              border: '1px solid var(--ob-border-2)',
              background: 'var(--ob-surface-2)',
              color: 'var(--ob-text-muted)',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.color = 'var(--ob-text)';
              event.currentTarget.style.borderColor = 'var(--ob-primary)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = 'var(--ob-text-muted)';
              event.currentTarget.style.borderColor = 'var(--ob-border-2)';
            }}
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
