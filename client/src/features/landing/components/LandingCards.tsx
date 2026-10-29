import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="ob-card" style={{ padding: 28 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: `${color}18`,
          border: `1px solid ${color}35`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
          color,
        }}
      >
        <Icon size={22} />
      </div>
      <h3
        style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 10, color: 'var(--ob-text)' }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--ob-text-muted)' }}>{desc}</p>
    </div>
  );
}

function WorkflowCard({
  emoji,
  title,
  desc,
  accent,
}: {
  emoji: string;
  title: string;
  desc: string;
  accent: string;
}) {
  const accentClass =
    accent === '#7c6eff'
      ? 'primary'
      : accent === '#06d6f7'
        ? 'cyan'
        : accent === '#a855f7'
          ? 'violet'
          : 'success';
  return (
    <div className={`ob-workflow-card ob-workflow-card-${accentClass}`}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          background: `${accent}08`,
          borderRadius: '0 0 0 80px',
        }}
      />
      <div style={{ fontSize: 32, marginBottom: 14 }}>{emoji}</div>
      <h3
        style={{
          fontWeight: 700,
          fontSize: '1rem',
          marginBottom: 8,
          color: 'var(--ob-text)',
          fontFamily: 'Space Grotesk, sans-serif',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--ob-text-muted)', lineHeight: 1.6 }}>{desc}</p>
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '0.8rem',
          color: accent,
          fontWeight: 600,
        }}
      >
        Learn more <ArrowRight size={13} />
      </div>
    </div>
  );
}

export { FeatureCard, WorkflowCard };
