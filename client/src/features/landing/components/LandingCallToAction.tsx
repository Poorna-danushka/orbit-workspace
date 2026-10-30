import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import OrbitIcon from '@/features/auth/components/OrbitIcon';
import { ROUTES } from '@/lib/constants/routes';

export default function LandingCallToAction() {
  return (
    <>
      {/* CTA BANNER */}
      <section className="ob-section-sm">
        <div className="ob-container">
          <div
            style={{
              borderRadius: 28,
              padding: 64,
              background:
                'linear-gradient(135deg, rgba(124,110,255,0.22) 0%, rgba(168,85,247,0.16) 50%, rgba(6,214,247,0.10) 100%)',
              border: '1px solid var(--ob-border-2)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,110,255,0.3), transparent)',
                filter: 'blur(40px)',
              }}
            />
            <div
              aria-hidden
              style={{
                position: 'absolute',
                bottom: -60,
                left: -60,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6,214,247,0.2), transparent)',
                filter: 'blur(40px)',
              }}
            />
            <div
              style={{
                color: 'var(--ob-primary)',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <OrbitIcon size={52} />
            </div>
            <h2
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                marginBottom: 16,
              }}
            >
              Get started with <span className="ob-gradient-text">Orbit Workspace</span> today
            </h2>
            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--ob-text-muted)',
                marginBottom: 36,
                maxWidth: 480,
                margin: '0 auto 36px',
              }}
            >
              Join thousands of teams who use Orbit to move faster, collaborate better, and build
              extraordinary things.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link
                href={ROUTES.register}
                className="ob-btn-primary"
                style={{ padding: '14px 32px', fontSize: '1rem' }}
              >
                Start for free <ArrowRight size={18} />
              </Link>
              <Link
                href={ROUTES.login}
                className="ob-btn-ghost"
                style={{ padding: '14px 32px', fontSize: '1rem' }}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
