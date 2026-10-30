import { Check, Star } from 'lucide-react';
import AuthPreviewFrame from './AuthPreviewFrame';
import AuthPreviewHeader from './AuthPreviewHeader';

export function InteractiveRegisterPreview() {
  return (
    <AuthPreviewFrame variant="register">
      <AuthPreviewHeader variant="register" />
      {/* Setup Checklist Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {[
          { text: 'Create workspace URL & domain', done: true },
          { text: 'Invite team members for free', done: true },
          { text: 'Connect GitHub, Slack & Figma', done: false },
        ].map((step, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 11,
              color: step.done ? 'var(--ob-auth-panel-text)' : 'var(--ob-auth-panel-muted)',
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: step.done ? 'rgba(34,211,160,0.18)' : 'var(--ob-auth-widget-card-bg)',
                border: step.done
                  ? '1px solid var(--ob-success)'
                  : '1px solid var(--ob-auth-widget-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ob-success)',
                flexShrink: 0,
              }}
            >
              {step.done ? (
                <Check size={11} />
              ) : (
                <span style={{ fontSize: 9, color: 'var(--ob-auth-panel-faint)' }}>{idx + 1}</span>
              )}
            </div>
            <span style={{ fontWeight: step.done ? 600 : 400 }}>{step.text}</span>
          </div>
        ))}
      </div>

      {/* Customer Testimonial Card */}
      <div
        style={{
          background: 'var(--ob-auth-widget-card-bg)',
          border: '1px solid var(--ob-auth-widget-border)',
          borderRadius: 12,
          padding: '12px 14px',
        }}
      >
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--ob-auth-panel-text)',
            lineHeight: 1.5,
            fontStyle: 'italic',
            marginBottom: 8,
          }}
        >
          &ldquo;We shipped 3x faster in our first month with Orbit. The workflow friction simply
          vanished.&rdquo;
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--ob-cyan), var(--ob-primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 800,
                color: '#fff',
              }}
            >
              S
            </div>
            <div>
              <p
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--ob-auth-panel-text)',
                  lineHeight: 1,
                }}
              >
                Sarah K.
              </p>
              <p style={{ fontSize: '0.68rem', color: 'var(--ob-auth-panel-muted)' }}>
                CTO at TechFlow
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 1 }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
            ))}
          </div>
        </div>
      </div>
    </AuthPreviewFrame>
  );
}
