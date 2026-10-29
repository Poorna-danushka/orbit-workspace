import { CheckCircle2, Layers, Sparkles } from 'lucide-react';

export function InteractiveLoginPreview() {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: '22px 24px',
        background: 'var(--ob-auth-widget-bg)',
        boxShadow: 'var(--ob-shadow)',
        border: '1px solid var(--ob-auth-widget-border)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(30px)',
      }}
    >
      {/* Glow background accent inside widget */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--ob-cyan-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: '1px solid var(--ob-auth-widget-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'var(--ob-auth-widget-card-bg)',
              border: '1px solid var(--ob-auth-widget-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ob-primary)',
            }}
          >
            <Layers size={16} />
          </div>
          <div>
            <p
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: 'var(--ob-auth-panel-text)',
                fontFamily: 'Space Grotesk, sans-serif',
                letterSpacing: '-0.01em',
              }}
            >
              Q4 Product Sprint
            </p>
            <p
              style={{
                fontSize: 10,
                color: 'var(--ob-auth-panel-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>12 Active Tasks</span> • <span>4 Teammates</span>
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: 10,
            background: 'rgba(34,211,160,0.12)',
            color: 'var(--ob-success)',
            border: '1px solid rgba(34,211,160,0.25)',
            padding: '4px 10px',
            borderRadius: 99,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--ob-success)',
              animation: 'pulse-ring 2s infinite',
            }}
          />
          ON TRACK
        </span>
      </div>

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
    </div>
  );
}

/* ─── Main Login Form ─────────────────────────────────────────────── */
