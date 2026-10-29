import Link from 'next/link';
import { Rocket, ShieldCheck, Sparkles, Users } from 'lucide-react';
import OrbitIcon from '@/features/auth/components/OrbitIcon';
import { InteractiveRegisterPreview } from './InteractiveRegisterPreview';

export function RegisterBrandPanel() {
  return (
    <>
      {/* ── LEFT PANEL — BRAND SHOWCASE ───────────────────────────── */}
      <div
        className="ob-auth-brand-panel"
        style={{
          flex: '0 0 44%',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--ob-auth-panel-bg)',
          borderRight: '1px solid var(--ob-auth-panel-border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 56px',
          boxSizing: 'border-box',
          height: '100dvh',
        }}
      >
        {/* Ambient Grid Background */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(var(--ob-border-2) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        />

        {/* Ambient Radial Glows */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-15%',
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--ob-cyan-glow) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-15%',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--ob-primary-glow) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Logo Header */}
        <Link
          href="/"
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
              color: 'var(--ob-cyan)',
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
                color: 'var(--ob-cyan)',
                letterSpacing: '-0.02em',
              }}
            >
              Workspace
            </span>
            <span
              style={{
                fontSize: 9,
                background: 'var(--ob-auth-widget-card-bg)',
                color: 'var(--ob-cyan)',
                border: '1px solid var(--ob-auth-widget-border)',
                padding: '2px 7px',
                borderRadius: 99,
                fontWeight: 700,
              }}
            >
              FREE
            </span>
          </div>
        </Link>

        {/* Center Content */}
        <div
          style={{
            zIndex: 2,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '24px 0',
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
            <Sparkles size={13} style={{ color: 'var(--ob-cyan)' }} />
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--ob-auth-panel-muted)',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              Free to start
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(2rem, 3vw, 2.7rem)',
              fontWeight: 800,
              color: 'var(--ob-auth-panel-text)',
              lineHeight: 1.15,
              letterSpacing: '-0.035em',
              marginBottom: 12,
            }}
          >
            Join 10,000+ teams <span className="ob-gradient-text">in orbit.</span>
          </h1>

          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--ob-auth-panel-muted)',
              lineHeight: 1.65,
              maxWidth: 360,
              marginBottom: 28,
            }}
          >
            Free workspace. No credit card needed. Set up your team in seconds.
          </p>

          {/* Interactive Mockup Component */}
          <InteractiveRegisterPreview />

          {/* Feature highlights */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 28 }}>
            {[
              { icon: Rocket, text: 'Fast Setup', color: 'var(--ob-primary)' },
              { icon: Users, text: 'Free Team Invites', color: 'var(--ob-cyan)' },
              { icon: ShieldCheck, text: 'Enterprise Security', color: 'var(--ob-success)' },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <item.icon size={15} style={{ color: item.color }} />
                <span
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--ob-auth-panel-muted)',
                    fontWeight: 500,
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
            paddingTop: 18,
            borderTop: '1px solid var(--ob-auth-panel-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ fontSize: 13, color: '#f59e0b' }}>
                  ★
                </span>
              ))}
            </div>
            <span
              style={{ fontSize: '0.78rem', color: 'var(--ob-auth-panel-muted)', fontWeight: 600 }}
            >
              Rated 4.9/5 · 10k+ teams
            </span>
          </div>
          <span
            style={{ fontSize: '0.75rem', color: 'var(--ob-auth-panel-faint)', fontWeight: 500 }}
          >
            SOC2 Compliant
          </span>
        </div>
      </div>
    </>
  );
}
