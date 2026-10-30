import Link from 'next/link';
import OrbitIcon from '@/components/ui/OrbitIcon';

export default function LandingSiteFooter() {
  return (
    <>
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
