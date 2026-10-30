interface OrbitFeature {
  icon: string;
  label: string;
  color: string;
  orbit: number;
  speed: string;
  startAngle: number;
}

const features: OrbitFeature[] = [
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

export default function OrbitingFeatures() {
  return (
    <>
      {features.map((feature, index) => {
        const diameter = feature.orbit * 2;
        const isInner = feature.orbit === 110;
        const isMid = feature.orbit === 175;
        const delay = `${-((parseInt(feature.speed) * feature.startAngle) / 360)}s`;

        return (
          <div
            key={feature.label}
            className="ob-orbital-decoration"
            style={{
              position: 'absolute',
              width: diameter,
              height: diameter,
              borderRadius: '50%',
              animation: `orbit-ccw ${feature.speed} linear infinite`,
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
                animation: `counter-rotate ${feature.speed} linear infinite, dot-float ${3 + (index % 3)}s ease-in-out infinite`,
                animationDelay: `${delay}, ${index * 0.4}s`,
                pointerEvents: 'auto',
              }}
            >
              <div
                className="ob-orbital-core"
                style={{
                  width: isInner ? 44 : isMid ? 52 : 60,
                  height: isInner ? 44 : isMid ? 52 : 60,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, ${feature.color}30, ${feature.color}10)`,
                  border: `1.5px solid ${feature.color}50`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                  boxShadow: `0 0 16px ${feature.color}25, inset 0 1px 0 rgba(255,255,255,0.08)`,
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  gap: 1,
                }}
              >
                <span style={{ fontSize: isInner ? 14 : isMid ? 18 : 20, lineHeight: 1 }}>
                  {feature.icon}
                </span>
                {!isInner && (
                  <span
                    style={{
                      fontSize: 6,
                      color: feature.color,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      opacity: 0.85,
                    }}
                  >
                    {feature.label.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
