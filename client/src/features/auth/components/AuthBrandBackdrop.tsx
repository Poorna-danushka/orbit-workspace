type AuthBrandVariant = 'login' | 'register';

export default function AuthBrandBackdrop({ variant }: { variant: AuthBrandVariant }) {
  const isLogin = variant === 'login';

  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(var(--ob-border-2) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-10%',
          left: isLogin ? '-15%' : undefined,
          right: isLogin ? undefined : '-15%',
          width: isLogin ? 500 : 480,
          height: isLogin ? 500 : 480,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${isLogin ? 'var(--ob-primary-glow)' : 'var(--ob-cyan-glow)'} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: isLogin ? '-15%' : undefined,
          left: isLogin ? undefined : '-15%',
          width: isLogin ? 450 : 420,
          height: isLogin ? 450 : 420,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${isLogin ? 'var(--ob-cyan-glow)' : 'var(--ob-primary-glow)'} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
