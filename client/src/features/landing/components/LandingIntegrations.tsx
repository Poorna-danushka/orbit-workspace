export default function LandingIntegrations() {
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
    </>
  );
}
