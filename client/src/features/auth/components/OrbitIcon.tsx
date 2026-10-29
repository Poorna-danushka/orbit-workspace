'use client';

interface OrbitIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  useImage?: boolean;
}

export default function OrbitIcon({ size = 36, className = '', style, useImage = true }: OrbitIconProps) {
  if (useImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo.png"
        alt="Orbit Logo"
        width={size}
        height={size}
        className={`rounded-xl object-cover shadow-sm transition-all hover:scale-105 ${className}`}
        style={{ width: size, height: size, ...style }}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} style={style} aria-hidden="true">
      {/* Outer Orbit Ring */}
      <ellipse cx="50" cy="50" rx="44" ry="16" stroke="currentColor" strokeWidth="4.5" opacity="0.9" transform="rotate(-22 50 50)" />
      {/* Orbiting Satellite Node */}
      <circle cx="86" cy="37" r="6" fill="currentColor" />
      {/* Core "O" Planet */}
      <path
        d="M50 20 C66.5685 20 80 33.4315 80 50 C80 66.5685 66.5685 80 50 80 C33.4315 80 20 66.5685 20 50 C20 33.4315 33.4315 20 50 20 Z M50 34 C41.1634 34 34 41.1634 34 50 C34 58.8366 41.1634 66 50 66 C58.8366 66 66 58.8366 66 50 C66 41.1634 58.8366 34 50 34 Z"
        fill="currentColor"
      />
    </svg>
  );
}
