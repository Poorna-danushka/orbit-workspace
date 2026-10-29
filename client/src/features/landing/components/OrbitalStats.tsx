export default function OrbitalStats() {
  return (
    <>
      {/* Floating stat cards */}
      <div
        className="ob-glass ob-orbital-stat"
        style={{
          position: 'absolute',
          bottom: -10,
          left: -40,
          borderRadius: 14,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'stat-pop 4s ease-in-out infinite',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 20,
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(34,211,160,0.15)',
            border: '1px solid rgba(34,211,160,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
        >
          🎯
        </div>
        <div>
          <p style={{ fontSize: 10, color: 'var(--ob-text-muted)' }}>Completed Today</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#22d3a0' }}>+24 tasks</p>
        </div>
      </div>

      <div
        className="ob-glass ob-orbital-stat"
        style={{
          position: 'absolute',
          top: 20,
          right: -50,
          borderRadius: 14,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'stat-pop 5s ease-in-out infinite',
          animationDelay: '1.5s',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 20,
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(124,110,255,0.15)',
            border: '1px solid rgba(124,110,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
        >
          ⚡
        </div>
        <div>
          <p style={{ fontSize: 10, color: 'var(--ob-text-muted)' }}>Team velocity</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#7c6eff' }}>98% on track</p>
        </div>
      </div>

      <div
        className="ob-glass ob-orbital-stat"
        style={{
          position: 'absolute',
          top: '42%',
          right: -60,
          borderRadius: 14,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'stat-pop 4.5s ease-in-out infinite',
          animationDelay: '0.8s',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 20,
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(6,214,247,0.15)',
            border: '1px solid rgba(6,214,247,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
        >
          👥
        </div>
        <div>
          <p style={{ fontSize: 10, color: 'var(--ob-text-muted)' }}>Active members</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#06d6f7' }}>12 online</p>
        </div>
      </div>
    </>
  );
}
