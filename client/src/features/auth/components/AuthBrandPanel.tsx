import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, Rocket, ShieldCheck, Sparkles, Users, Zap } from 'lucide-react';
import OrbitIcon from '@/components/ui/OrbitIcon';
import { ROUTES } from '@/lib/constants/routes';
import AuthBrandBackdrop from './AuthBrandBackdrop';
import AuthBrandFooter from './AuthBrandFooter';
import { InteractiveLoginPreview } from './InteractiveLoginPreview';
import { InteractiveRegisterPreview } from './InteractiveRegisterPreview';

type AuthBrandVariant = 'login' | 'register';

interface Benefit {
  icon: LucideIcon;
  text: string;
  color: string;
}

const panelStyle = {
  flex: '0 0 44%',
  position: 'relative' as const,
  overflow: 'hidden',
  background: 'var(--ob-auth-panel-bg)',
  borderRight: '1px solid var(--ob-auth-panel-border)',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'space-between',
  padding: '40px 56px',
  boxSizing: 'border-box' as const,
  height: '100dvh',
};

const benefits: Record<AuthBrandVariant, Benefit[]> = {
  login: [
    { icon: Zap, text: 'Instant Sync', color: 'var(--ob-primary)' },
    { icon: BarChart3, text: 'Live Analytics', color: 'var(--ob-cyan)' },
    { icon: ShieldCheck, text: 'Enterprise Security', color: 'var(--ob-success)' },
  ],
  register: [
    { icon: Rocket, text: 'Fast Setup', color: 'var(--ob-primary)' },
    { icon: Users, text: 'Free Team Invites', color: 'var(--ob-cyan)' },
    { icon: ShieldCheck, text: 'Enterprise Security', color: 'var(--ob-success)' },
  ],
};

export default function AuthBrandPanel({ variant }: { variant: AuthBrandVariant }) {
  const isLogin = variant === 'login';
  const accent = isLogin ? 'var(--ob-primary)' : 'var(--ob-cyan)';
  const preview = isLogin ? <InteractiveLoginPreview /> : <InteractiveRegisterPreview />;

  return (
    <div className="ob-auth-brand-panel" style={panelStyle}>
      <AuthBrandBackdrop variant={variant} />

      <Link
        href={ROUTES.home}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textDecoration: 'none',
          zIndex: 2,
          flexShrink: 0,
          width: 'fit-content',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'var(--ob-auth-widget-card-bg)',
            border: '1px solid var(--ob-auth-widget-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--ob-shadow-glow)',
            color: accent,
          }}
        >
          <OrbitIcon size={24} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: 'var(--ob-auth-panel-text)',
              letterSpacing: '-0.02em',
            }}
          >
            Orbit
          </span>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: accent,
              letterSpacing: '-0.02em',
            }}
          >
            Workspace
          </span>
          <span
            style={{
              fontSize: 9,
              background: 'var(--ob-auth-widget-card-bg)',
              color: accent,
              border: '1px solid var(--ob-auth-widget-border)',
              padding: '2px 7px',
              borderRadius: 99,
              fontWeight: 700,
            }}
          >
            {isLogin ? 'v2.4' : 'FREE'}
          </span>
        </div>
      </Link>

      <div
        style={{
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: isLogin ? '28px 0' : '24px 0',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 100,
            background: 'var(--ob-auth-widget-card-bg)',
            border: '1px solid var(--ob-auth-widget-border)',
            marginBottom: 20,
            width: 'fit-content',
          }}
        >
          <Sparkles size={13} style={{ color: accent }} />
          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--ob-auth-panel-muted)',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            {isLogin ? 'Welcome back' : 'Free to start'}
          </span>
        </div>
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: isLogin ? 'clamp(2rem, 3vw, 2.8rem)' : 'clamp(2rem, 3vw, 2.7rem)',
            fontWeight: 800,
            color: 'var(--ob-auth-panel-text)',
            lineHeight: 1.15,
            letterSpacing: '-0.035em',
            marginBottom: isLogin ? 14 : 12,
          }}
        >
          {isLogin ? (
            <>
              Pick up where <span className="ob-gradient-text">you left off.</span>
            </>
          ) : (
            <>
              Join 10,000+ teams <span className="ob-gradient-text">in orbit.</span>
            </>
          )}
        </h1>
        <p
          style={{
            fontSize: isLogin ? '0.9rem' : '0.88rem',
            color: 'var(--ob-auth-panel-muted)',
            lineHeight: 1.65,
            maxWidth: isLogin ? 380 : 360,
            marginBottom: isLogin ? 32 : 28,
          }}
        >
          {isLogin
            ? 'Your sprints, team collaboration, and real-time project metrics are ready for action.'
            : 'Free workspace. No credit card needed. Set up your team in seconds.'}
        </p>
        {preview}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: isLogin ? 32 : 28 }}>
          {benefits[variant].map(({ icon: Icon, text, color }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon size={15} style={{ color }} />
              <span
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--ob-auth-panel-muted)',
                  fontWeight: 500,
                }}
              >
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AuthBrandFooter variant={variant} />
    </div>
  );
}
