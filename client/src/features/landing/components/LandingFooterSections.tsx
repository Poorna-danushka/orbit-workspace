'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import OrbitIcon from '@/features/auth/components/OrbitIcon';

export default function LandingFooterSections() {
  return (
    <>
      {/* INTEGRATIONS */}
      <section
        className="ob-section-sm"
        style={{
          background: 'var(--ob-surface)',
          borderTop: '1px solid var(--ob-border)',
          borderBottom: '1px solid var(--ob-border)',
        }}
      >
        <div className="ob-container" style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ob-text-muted)',
              marginBottom: 16,
            }}
          >
            INTEGRATIONS
          </p>
          <h2
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              marginBottom: 12,
            }}
          >
            Do more with <span className="ob-gradient-text-2">Orbit</span>
          </h2>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--ob-text-muted)',
              marginBottom: 40,
              maxWidth: 500,
              margin: '0 auto 40px',
            }}
          >
            Connect with the tools your team already loves. Orbit integrates seamlessly with your
            entire workflow.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14 }}>
            {[
              { name: 'Slack', icon: '💬' },
              { name: 'GitHub', icon: '🐙' },
              { name: 'Figma', icon: '🎨' },
              { name: 'Google Drive', icon: '📁' },
              { name: 'Notion', icon: '📝' },
              { name: 'Jira', icon: '🔵' },
              { name: 'Zoom', icon: '📹' },
              { name: 'Linear', icon: '⚡' },
            ].map((i) => (
              <div key={i.name} className="ob-integration-chip">
                <span style={{ fontSize: 18 }}>{i.icon}</span> {i.name}
              </div>
            ))}
          </div>
        </div>
      </section>

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
                href="/register"
                className="ob-btn-primary"
                style={{ padding: '14px 32px', fontSize: '1rem' }}
              >
                Start for free <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="ob-btn-ghost"
                style={{ padding: '14px 32px', fontSize: '1rem' }}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid var(--ob-border)',
          background: 'var(--ob-surface)',
          padding: '56px 0 32px',
        }}
      >
        <div className="ob-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 40,
              marginBottom: 48,
            }}
          >
            <div>
              <Link
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textDecoration: 'none',
                  color: 'var(--ob-text)',
                  marginBottom: 16,
                }}
              >
                <div style={{ color: 'var(--ob-primary)' }}>
                  <OrbitIcon size={28} />
                </div>
                <span
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  Orbit <span style={{ color: 'var(--ob-primary)' }}>Workspace</span>
                </span>
              </Link>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--ob-text-muted)',
                  lineHeight: 1.7,
                  maxWidth: 260,
                }}
              >
                All your projects, tasks, and team in one intelligent orbit. Built for ambitious
                teams.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Community', 'Status', 'Contact'] },
            ].map((col) => (
              <div key={col.title}>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: 'var(--ob-text)',
                    marginBottom: 16,
                  }}
                >
                  {col.title}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map((l) => (
                    <a key={l} href="#" className="ob-text-link" style={{ fontSize: '0.85rem' }}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: '1px solid var(--ob-border)',
              paddingTop: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <p style={{ fontSize: '0.8rem', color: 'var(--ob-text-faint)' }}>
              © {new Date().getFullYear()} Orbit Workspace. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                <a key={l} href="#" className="ob-faint-link">
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
