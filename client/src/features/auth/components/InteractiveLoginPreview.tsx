import { CheckCircle2, Sparkles } from 'lucide-react';
import AuthPreviewFrame from './AuthPreviewFrame';
import AuthPreviewHeader from './AuthPreviewHeader';

export function InteractiveLoginPreview() {
  return (
    <AuthPreviewFrame variant="login">
      <AuthPreviewHeader variant="login" />
      {/* Progress Bar & Velocity Row */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ob-auth-panel-muted)' }}>
            Sprint Velocity
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: 'var(--ob-cyan)',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            88% Completed
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: 6,
            background: 'var(--ob-auth-widget-card-bg)',
            borderRadius: 99,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '88%',
              height: '100%',
              background: 'linear-gradient(90deg, var(--ob-primary) 0%, var(--ob-cyan) 100%)',
              borderRadius: 99,
            }}
          />
        </div>
      </div>

      {/* Live Activity Notification */}
      <div
        style={{
          background: 'var(--ob-auth-widget-card-bg)',
          border: '1px solid var(--ob-auth-widget-border)',
          borderRadius: 12,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--ob-primary), var(--ob-violet))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <Sparkles size={14} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--ob-auth-panel-text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Auth UI Redesign Completed
          </p>
          <p style={{ fontSize: 10, color: 'var(--ob-auth-panel-muted)' }}>
            Just now • Syncing with Main Branch
          </p>
        </div>
        <CheckCircle2 size={15} style={{ color: 'var(--ob-success)', flexShrink: 0 }} />
      </div>
    </AuthPreviewFrame>
  );
}
