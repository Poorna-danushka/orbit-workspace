import type { ReactNode } from 'react';

interface LandingSectionHeadingProps {
  eyebrow: string;
  accent: string;
  title: ReactNode;
  description?: string;
}

export default function LandingSectionHeading({
  eyebrow,
  accent,
  title,
  description,
}: LandingSectionHeadingProps) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 60px' }}>
      <p
        style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: accent,
          marginBottom: 12,
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          marginBottom: 16,
        }}
      >
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: '1rem', color: 'var(--ob-text-muted)', lineHeight: 1.7 }}>
          {description}
        </p>
      )}
    </div>
  );
}
