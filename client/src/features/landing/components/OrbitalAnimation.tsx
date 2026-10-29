import OrbitIcon from '@/features/auth/components/OrbitIcon';
import OrbitalStats from './OrbitalStats';

export function OrbitalAnimation() {
  const features = [
    { icon: '📋', label: 'Kanban', color: '#7c6eff', orbit: 110, speed: '18s', startAngle: 0 },
    { icon: '📊', label: 'Analytics', color: '#06d6f7', orbit: 110, speed: '18s', startAngle: 90 },
    { icon: '👥', label: 'Teams', color: '#22d3a0', orbit: 110, speed: '18s', startAngle: 180 },
    { icon: '🔔', label: 'Alerts', color: '#f59e0b', orbit: 110, speed: '18s', startAngle: 270 },

    { icon: '⚡', label: 'Automation', color: '#a855f7', orbit: 175, speed: '28s', startAngle: 45 },
    { icon: '🎯', label: 'Goals', color: '#f43f5e', orbit: 175, speed: '28s', startAngle: 165 },
    { icon: '💬', label: 'Chat', color: '#06d6f7', orbit: 175, speed: '28s', startAngle: 285 },

    {
      icon: '🔗',
      label: 'Integrations',
      color: '#7c6eff',
      orbit: 240,
      speed: '40s',
      startAngle: 20,
    },
    { icon: '📁', label: 'Projects', color: '#22d3a0', orbit: 240, speed: '40s', startAngle: 110 },
    { icon: '🛡️', label: 'Security', color: '#f59e0b', orbit: 240, speed: '40s', startAngle: 200 },
    { icon: '📅', label: 'Calendar', color: '#a855f7', orbit: 240, speed: '40s', startAngle: 310 },
  ];

  return (
    <div
      className="ob-orbital-animation"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        maxWidth: 560,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes orbit-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes counter-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes core-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,110,255,0), 0 0 40px rgba(124,110,255,0.5), 0 0 80px rgba(124,110,255,0.2); transform: scale(1); }
          50% { box-shadow: 0 0 0 20px rgba(124,110,255,0.06), 0 0 60px rgba(124,110,255,0.7), 0 0 120px rgba(124,110,255,0.3); transform: scale(1.04); }
        }
        @keyframes ring-shimmer {
          0% { opacity: 0.25; }
          50% { opacity: 0.55; }
          100% { opacity: 0.25; }
        }
        @keyframes dot-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.12); }
        }
        @keyframes stat-pop {
          0%, 100% { transform: scale(1) translateY(0); opacity: 0.85; }
          50% { transform: scale(1.06) translateY(-4px); opacity: 1; }
        }
      `}</style>

      {/* Outer ambient glow */}
      <div
        aria-hidden
        className="ob-orbital-decoration"
        style={{
          position: 'absolute',
          inset: -60,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at center, rgba(124,110,255,0.18) 0%, rgba(6,214,247,0.08) 40%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Ring 3 — outermost */}
      <div
        className="ob-orbital-decoration"
        style={{
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          border: '1px solid rgba(124,110,255,0.15)',
          animation: 'ring-shimmer 6s ease-in-out infinite',
          animationDelay: '0s',
        }}
      />
      <div
        className="ob-orbital-decoration"
        style={{
          position: 'absolute',
          width: 476,
          height: 476,
          borderRadius: '50%',
          border: '1px dashed rgba(124,110,255,0.06)',
        }}
      />

      {/* Ring 2 */}
      <div
        className="ob-orbital-decoration"
        style={{
          position: 'absolute',
          width: 350,
          height: 350,
          borderRadius: '50%',
          border: '1px solid rgba(6,214,247,0.14)',
          animation: 'ring-shimmer 5s ease-in-out infinite',
          animationDelay: '1s',
        }}
      />

      {/* Ring 1 — innermost */}
      <div
        className="ob-orbital-decoration"
        style={{
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: '50%',
          border: '1px solid rgba(168,85,247,0.18)',
          animation: 'ring-shimmer 4s ease-in-out infinite',
          animationDelay: '0.5s',
        }}
      />

      {/* Orbit paths (visual only) */}
      {[220, 350, 480].map((d, i) => (
        <div
          key={d}
          className="ob-orbital-decoration"
          style={{
            position: 'absolute',
            width: d,
            height: d,
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, transparent 48%, rgba(${i === 0 ? '168,85,247' : i === 1 ? '6,214,247' : '124,110,255'},0.04) 50%, transparent 52%)`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Orbiting dots */}
      {features.map((f, i) => {
        const diameter = f.orbit * 2;
        const isInner = f.orbit === 110;
        const isMid = f.orbit === 175;
        const speed = f.speed;
        const delay = `${-((parseInt(speed) * f.startAngle) / 360)}s`;
        return (
          <div
            key={f.label}
            className="ob-orbital-decoration"
            style={{
              position: 'absolute',
              width: diameter,
              height: diameter,
              borderRadius: '50%',
              animation: `orbit-ccw ${speed} linear infinite`,
              animationDelay: delay,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: isInner ? -22 : isMid ? -26 : -30,
                transform: 'translateY(-50%)',
                animation: `counter-rotate ${speed} linear infinite, dot-float ${3 + (i % 3)}s ease-in-out infinite`,
                animationDelay: `${delay}, ${i * 0.4}s`,
                pointerEvents: 'auto',
              }}
            >
              <div
                className="ob-orbital-core"
                style={{
                  width: isInner ? 44 : isMid ? 52 : 60,
                  height: isInner ? 44 : isMid ? 52 : 60,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, ${f.color}30, ${f.color}10)`,
                  border: `1.5px solid ${f.color}50`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                  boxShadow: `0 0 16px ${f.color}25, inset 0 1px 0 rgba(255,255,255,0.08)`,
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  gap: 1,
                }}
              >
                <span style={{ fontSize: isInner ? 14 : isMid ? 18 : 20, lineHeight: 1 }}>
                  {f.icon}
                </span>
                {!isInner && (
                  <span
                    style={{
                      fontSize: 6,
                      color: f.color,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      opacity: 0.85,
                    }}
                  >
                    {f.label.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Core node */}
      <div
        style={{
          position: 'relative',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'var(--ob-surface)',
          border: '2px solid rgba(124,110,255,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'core-pulse 3.5s ease-in-out infinite',
          zIndex: 10,
          gap: 2,
        }}
      >
        <OrbitIcon size={28} className="text-[var(--ob-primary)]" />
        <span
          style={{
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: 'rgba(124,110,255,0.9)',
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          ORBIT
        </span>
      </div>

      <OrbitalStats />
    </div>
  );
}
