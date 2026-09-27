'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Check, ChevronDown,
  LayoutDashboard, Calendar, Zap, Users,
  BarChart3, MessageSquare, Puzzle, Bell,
  Star, Globe, Shield, Rocket, Menu, X, Sparkles,
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import OrbitIcon from '@/components/auth/OrbitIcon';

function StarField() {
  const stars = [
    { top: '8%', left: '12%', size: 2, dur: '2.8s', delay: '0s' },
    { top: '15%', left: '78%', size: 1.5, dur: '3.5s', delay: '0.5s' },
    { top: '22%', left: '45%', size: 1, dur: '4s', delay: '1s' },
    { top: '35%', left: '88%', size: 2, dur: '2.5s', delay: '1.5s' },
    { top: '42%', left: '5%', size: 1.5, dur: '3.8s', delay: '0.3s' },
    { top: '55%', left: '65%', size: 1, dur: '3.2s', delay: '0.8s' },
    { top: '68%', left: '28%', size: 2, dur: '4.2s', delay: '0.2s' },
    { top: '72%', left: '92%', size: 1.5, dur: '2.9s', delay: '1.2s' },
    { top: '85%', left: '52%', size: 1, dur: '3.6s', delay: '0.7s' },
    { top: '90%', left: '18%', size: 2, dur: '3s', delay: '0.4s' },
    { top: '5%', left: '55%', size: 1.5, dur: '4.5s', delay: '1.8s' },
    { top: '30%', left: '72%', size: 1, dur: '2.6s', delay: '0.6s' },
  ];
  return (
    <div className="ob-stars" aria-hidden="true">
      {stars.map((s, i) => (
        <span key={i} className="ob-star" style={{
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          '--twinkle-dur': s.dur,
          '--twinkle-delay': s.delay,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

function OrbitalAnimation() {
  const features = [
    { icon: '📋', label: 'Kanban', color: '#7c6eff', orbit: 110, speed: '18s', startAngle: 0 },
    { icon: '📊', label: 'Analytics', color: '#06d6f7', orbit: 110, speed: '18s', startAngle: 90 },
    { icon: '👥', label: 'Teams', color: '#22d3a0', orbit: 110, speed: '18s', startAngle: 180 },
    { icon: '🔔', label: 'Alerts', color: '#f59e0b', orbit: 110, speed: '18s', startAngle: 270 },

    { icon: '⚡', label: 'Automation', color: '#a855f7', orbit: 175, speed: '28s', startAngle: 45 },
    { icon: '🎯', label: 'Goals', color: '#f43f5e', orbit: 175, speed: '28s', startAngle: 165 },
    { icon: '💬', label: 'Chat', color: '#06d6f7', orbit: 175, speed: '28s', startAngle: 285 },

    { icon: '🔗', label: 'Integrations', color: '#7c6eff', orbit: 240, speed: '40s', startAngle: 20 },
    { icon: '📁', label: 'Projects', color: '#22d3a0', orbit: 240, speed: '40s', startAngle: 110 },
    { icon: '🛡️', label: 'Security', color: '#f59e0b', orbit: 240, speed: '40s', startAngle: 200 },
    { icon: '📅', label: 'Calendar', color: '#a855f7', orbit: 240, speed: '40s', startAngle: 310 },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '1', maxWidth: 560, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      <div aria-hidden style={{ position: 'absolute', inset: -60, borderRadius: '50%', background: 'radial-gradient(circle at center, rgba(124,110,255,0.18) 0%, rgba(6,214,247,0.08) 40%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

      {/* Ring 3 — outermost */}
      <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', border: '1px solid rgba(124,110,255,0.15)', animation: 'ring-shimmer 6s ease-in-out infinite', animationDelay: '0s' }} />
      <div style={{ position: 'absolute', width: 476, height: 476, borderRadius: '50%', border: '1px dashed rgba(124,110,255,0.06)' }} />

      {/* Ring 2 */}
      <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', border: '1px solid rgba(6,214,247,0.14)', animation: 'ring-shimmer 5s ease-in-out infinite', animationDelay: '1s' }} />

      {/* Ring 1 — innermost */}
      <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(168,85,247,0.18)', animation: 'ring-shimmer 4s ease-in-out infinite', animationDelay: '0.5s' }} />

      {/* Orbit paths (visual only) */}
      {[220, 350, 480].map((d, i) => (
        <div key={d} style={{
          position: 'absolute',
          width: d, height: d,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, transparent 48%, rgba(${i === 0 ? '168,85,247' : i === 1 ? '6,214,247' : '124,110,255'},0.04) 50%, transparent 52%)`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Orbiting dots */}
      {features.map((f, i) => {
        const diameter = f.orbit * 2;
        const isInner = f.orbit === 110;
        const isMid = f.orbit === 175;
        const speed = f.speed;
        const delay = `${-(parseInt(speed) * f.startAngle / 360)}s`;
        return (
          <div
            key={f.label}
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
              <div style={{
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
              }}>
                <span style={{ fontSize: isInner ? 14 : isMid ? 18 : 20, lineHeight: 1 }}>{f.icon}</span>
                {!isInner && <span style={{ fontSize: 6, color: f.color, fontWeight: 700, letterSpacing: '0.05em', opacity: 0.85 }}>{f.label.toUpperCase()}</span>}
              </div>
            </div>
          </div>
        );
      })}

      {/* Core node */}
      <div style={{
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0e0f1c 0%, #141528 100%)',
        border: '2px solid rgba(124,110,255,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'core-pulse 3.5s ease-in-out infinite',
        zIndex: 10,
        gap: 2,
      }}>
        <OrbitIcon size={28} className="text-[var(--ob-primary)]" />
        <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(124,110,255,0.9)', fontFamily: 'Space Grotesk, sans-serif' }}>ORBIT</span>
      </div>

      {/* Floating stat cards */}
      <div className="ob-glass" style={{
        position: 'absolute', bottom: -10, left: -40,
        borderRadius: 14, padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'stat-pop 4s ease-in-out infinite',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        zIndex: 20, whiteSpace: 'nowrap',
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,211,160,0.15)', border: '1px solid rgba(34,211,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎯</div>
        <div>
          <p style={{ fontSize: 10, color: 'var(--ob-text-muted)' }}>Completed Today</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#22d3a0' }}>+24 tasks</p>
        </div>
      </div>

      <div className="ob-glass" style={{
        position: 'absolute', top: 20, right: -50,
        borderRadius: 14, padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'stat-pop 5s ease-in-out infinite',
        animationDelay: '1.5s',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        zIndex: 20, whiteSpace: 'nowrap',
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,110,255,0.15)', border: '1px solid rgba(124,110,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
        <div>
          <p style={{ fontSize: 10, color: 'var(--ob-text-muted)' }}>Team velocity</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#7c6eff' }}>98% on track</p>
        </div>
      </div>

      <div className="ob-glass" style={{
        position: 'absolute', top: '42%', right: -60,
        borderRadius: 14, padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'stat-pop 4.5s ease-in-out infinite',
        animationDelay: '0.8s',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        zIndex: 20, whiteSpace: 'nowrap',
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(6,214,247,0.15)', border: '1px solid rgba(6,214,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👥</div>
        <div>
          <p style={{ fontSize: 10, color: 'var(--ob-text-muted)' }}>Active members</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#06d6f7' }}>12 online</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: {
  icon: any; title: string; desc: string; color: string;
}) {
  return (
    <div className="ob-card" style={{ padding: 28 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `${color}18`, border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18, color,
      }}>
        <Icon size={22} />
      </div>
      <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 10, color: 'var(--ob-text)' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--ob-text-muted)' }}>{desc}</p>
    </div>
  );
}

function WorkflowCard({ emoji, title, desc, accent }: {
  emoji: string; title: string; desc: string; accent: string;
}) {
  const accentClass = accent === '#7c6eff' ? 'primary' : accent === '#06d6f7' ? 'cyan' : accent === '#a855f7' ? 'violet' : 'success';
  return (
    <div className={`ob-workflow-card ob-workflow-card-${accentClass}`}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `${accent}08`, borderRadius: '0 0 0 80px' }} />
      <div style={{ fontSize: 32, marginBottom: 14 }}>{emoji}</div>
      <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8, color: 'var(--ob-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{title}</h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--ob-text-muted)', lineHeight: 1.6 }}>{desc}</p>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: accent, fontWeight: 600 }}>
        Learn more <ArrowRight size={13} />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--ob-bg)', color: 'var(--ob-text)', overflowX: 'hidden' }}>

      {/* FLOATING GLASS NAVBAR */}
      <div className="ob-nav-wrapper">
        <nav className={`ob-nav ${scrolled ? 'scrolled' : ''}`}>
          {/* Brand Logo */}
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            textDecoration: 'none', color: 'var(--ob-text)',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(124,110,255,0.35), rgba(6,214,247,0.25))',
              border: '1px solid var(--ob-border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ob-primary)',
              boxShadow: '0 4px 14px rgba(124,110,255,0.28)',
              transition: 'transform 0.25s ease',
            }}>
              <OrbitIcon size={22} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--ob-text)', letterSpacing: '-0.02em' }}>Orbit</span>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--ob-primary)', letterSpacing: '-0.02em' }}>Workspace</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ob-success)', display: 'inline-block', flexShrink: 0 }} title="All Systems Operational" />
            </div>
          </Link>

          {/* Navigation Links — Desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="hidden md:flex">
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 12 }}>
              <a href="#features" className="ob-nav-link">Features</a>
              <a href="#solutions" className="ob-nav-link">Solutions</a>
            </nav>
            <ThemeToggle />
            <Link href="/login" className="ob-nav-link" style={{ fontWeight: 600, padding: '8px 18px' }}>
              Log in
            </Link>
            <Link href="/register" className="ob-btn-primary" style={{ padding: '9px 24px', fontSize: '0.88rem', borderRadius: 99, marginLeft: 8, boxShadow: '0 6px 24px rgba(124,110,255,0.38)' }}>
              <span>Get started free</span> <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'var(--ob-surface-2)',
                border: '1px solid var(--ob-border-2)',
                borderRadius: 12,
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ob-text)',
                cursor: 'pointer',
              }}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Glass Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 86,
            left: 16,
            right: 16,
            zIndex: 99,
            background: 'var(--ob-glass-strong)',
            border: '1px solid var(--ob-border-2)',
            borderRadius: 20,
            padding: 20,
            backdropFilter: 'blur(32px)',
            boxShadow: 'var(--ob-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            animation: 'fadeInUp 0.3s ease forwards',
          }}
          className="md:hidden"
        >
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="ob-nav-link" style={{ padding: '12px 16px', fontSize: '1rem', width: '100%' }}>Features</a>
          <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="ob-nav-link" style={{ padding: '12px 16px', fontSize: '1rem', width: '100%' }}>Solutions</a>
          <div style={{ height: 1, background: 'var(--ob-border)', margin: '4px 0' }} />
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="ob-btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
            Log in
          </Link>
          <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="ob-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <span>Get started free</span> <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* HERO SECTION */}
      <section style={{ position: 'relative', minHeight: '100dvh', display: 'flex', alignItems: 'center', paddingTop: 95, paddingBottom: 40, boxSizing: 'border-box', overflow: 'hidden' }}>
        <StarField />
        <div aria-hidden style={{ position: 'absolute', top: '10%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,110,255,0.14) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: '5%', right: '-5%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,214,247,0.12) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />

        <div className="ob-container" style={{ width: '100%', position: 'relative', zIndex: 5 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px 60px',
            alignItems: 'center',
          }}>
            {/* LEFT COLUMN: HERO ACTION & CONTENT */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {/* Hero badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '7px 18px', borderRadius: 100,
                border: '1px solid var(--ob-border-2)',
                background: 'var(--ob-surface-2)',
                marginBottom: 24,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ob-success)', display: 'inline-block', animation: 'pulse-ring 2s infinite', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--ob-text-muted)', fontWeight: 500 }}>Command center for ambitious teams</span>
              </div>

              {/* Hero Headline */}
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(2.6rem, 4.5vw, 4.2rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.04em', marginBottom: 20 }}>
                Your team's work,{' '}
                <span className="ob-gradient-text">in one orbit</span>
              </h1>

              {/* Subtitle */}
              <p style={{ fontSize: 'clamp(1rem, 1.4vw, 1.15rem)', lineHeight: 1.7, color: 'var(--ob-text-muted)', maxWidth: 480, marginBottom: 32 }}>
                Tasks, teammates, and tools — in perfect sync. Ship faster.
              </p>

              {/* CTA Action Bar */}
              <div style={{ width: '100%', maxWidth: 500, marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link href="/register" className="ob-btn-primary" style={{ height: 52, fontSize: '1rem', borderRadius: 99, padding: '0 32px', boxShadow: '0 8px 30px rgba(124,110,255,0.35)' }}>
                    Start for free <ArrowRight size={17} />
                  </Link>
                  <Link href="/login" className="ob-btn-ghost" style={{ height: 52, fontSize: '1rem', borderRadius: 99, padding: '0 28px' }}>
                    Sign in
                  </Link>
                </div>
              </div>

              {/* Feature Value Props Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', marginBottom: 32 }}>
                {['Free forever', 'No card required', 'Any team size'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--ob-text-muted)', background: 'var(--ob-surface)', padding: '4px 12px', borderRadius: 20, border: '1px solid var(--ob-border)' }}>
                    <Check size={13} style={{ color: 'var(--ob-success)' }} /> {t}
                  </span>
                ))}
              </div>

              {/* Quick Social Proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 16, borderTop: '1px solid var(--ob-border)' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: 13, color: '#f59e0b' }}>★</span>)}
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--ob-text-muted)', fontWeight: 500 }}>
                  <strong>4.9/5</strong> · 10,000+ teams
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: EYE-CATCHING ORBITAL ANIMATION */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <OrbitalAnimation />
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', animation: 'orbit-float 2s ease-in-out infinite', color: 'var(--ob-text-faint)' }}>
          <ChevronDown size={22} />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ padding: '24px 0', borderTop: '1px solid var(--ob-border)', borderBottom: '1px solid var(--ob-border)', background: 'var(--ob-surface)' }}>
        <div className="ob-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--ob-text-muted)' }}>Trusted by teams at</span>
            {['Notion', 'Linear', 'Vercel', 'Stripe', 'Figma', 'GitHub'].map(c => (
              <span key={c} style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ob-text-faint)', letterSpacing: '-0.01em', fontFamily: 'Space Grotesk, sans-serif' }}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="ob-section">
        <div className="ob-container">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 60px' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ob-primary)', marginBottom: 12 }}>WHY ORBIT</p>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
              A productivity <span className="ob-gradient-text-2">powerhouse</span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--ob-text-muted)', lineHeight: 1.7 }}>
              Define tasks, set goals, collaborate in real-time, and track everything from one unified workspace.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <FeatureCard icon={LayoutDashboard} title="One clear workspace" desc="Keep projects, tasks, files, and conversations connected in one focused home with real-time updates." color="#7c6eff" />
            <FeatureCard icon={BarChart3} title="Momentum you can see" desc="Turn team activity into useful signals so everyone knows what to tackle next without a meeting." color="#06d6f7" />
            <FeatureCard icon={Zap} title="Built for flow" desc="Move from idea to shipped without the busywork between every handoff. Automate the repetitive parts." color="#a855f7" />
            <FeatureCard icon={Users} title="Team at a glance" desc="See who's working on what, who's blocked, and what's nearly done — instantly, at every scale." color="#22d3a0" />
          </div>
        </div>
      </section>

      {/* WORKFLOWS */}
      <section id="solutions" className="ob-section" style={{ background: 'var(--ob-surface)' }}>
        <div className="ob-container">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 60px' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ob-cyan)', marginBottom: 12 }}>SOLUTIONS</p>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Workflows for every project, <span className="ob-gradient-text-2">big or small</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
            <WorkflowCard emoji="🚀" title="Project Management" desc="Plan sprints, track milestones, and deliver on time with beautiful boards and timelines." accent="#7c6eff" />
            <WorkflowCard emoji="📅" title="Meetings & Planning" desc="Align your team before, during, and after meetings with shared agendas and action items." accent="#06d6f7" />
            <WorkflowCard emoji="🎯" title="Onboarding" desc="Get new team members up to speed faster with structured task flows and role-based access." accent="#a855f7" />
            <WorkflowCard emoji="⚡" title="Task Manager" desc="Capture, prioritise, and complete tasks with custom filters, tags, and deadline reminders." accent="#22d3a0" />
          </div>
        </div>
      </section>

      {/* VIEW MODES */}
      <section className="ob-section">
        <div className="ob-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ob-violet)', marginBottom: 16 }}>MULTIPLE VIEWS</p>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
                See work in a whole <span className="ob-gradient-text-2">new way</span>
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--ob-text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
                Switch between Board, List, Timeline, Calendar, and Dashboard views. Every perspective you need to stay on top of every project.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: '📋', label: 'Kanban Board', desc: 'Visualise workflow stages' },
                  { icon: '📅', label: 'Calendar', desc: 'Deadline-focused view' },
                  { icon: '📊', label: 'Dashboard', desc: 'High-level progress overview' },
                  { icon: '📌', label: 'Timeline', desc: 'Gantt-style project roadmap' },
                ].map(v => (
                  <div key={v.label} className="ob-view-row">
                    <span style={{ fontSize: 20 }}>{v.icon}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ob-text)' }}>{v.label}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--ob-text-muted)' }}>{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="ob-glass-strong" style={{ borderRadius: 20, padding: 20, boxShadow: 'var(--ob-shadow-glow)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ob-text-muted)', marginBottom: 16 }}>Sprint Board — Week 3</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { col: 'To Do', color: '#7c6eff', tasks: ['API integration', 'Dark mode', 'Tests'] },
                    { col: 'In Progress', color: '#f59e0b', tasks: ['Homepage redesign', 'Auth flow'] },
                    { col: 'Done', color: '#22d3a0', tasks: ['DB schema', 'CI/CD pipeline', 'Figma kit'] },
                  ].map(col => (
                    <div key={col.col}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ob-text-muted)' }}>{col.col}</span>
                        <span style={{ fontSize: 9, background: `${col.color}22`, color: col.color, padding: '1px 5px', borderRadius: 4, marginLeft: 'auto' }}>{col.tasks.length}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {col.tasks.map(t => (
                          <div key={t} style={{ background: 'var(--ob-surface-3)', border: '1px solid var(--ob-border)', borderRadius: 8, padding: '8px 10px', fontSize: 10, color: 'var(--ob-text)' }}>{t}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="ob-section-sm" style={{ background: 'var(--ob-surface)', borderTop: '1px solid var(--ob-border)', borderBottom: '1px solid var(--ob-border)' }}>
        <div className="ob-container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ob-text-muted)', marginBottom: 16 }}>INTEGRATIONS</p>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12 }}>
            Do more with <span className="ob-gradient-text-2">Orbit</span>
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--ob-text-muted)', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
            Connect with the tools your team already loves. Orbit integrates seamlessly with your entire workflow.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14 }}>
            {[
              { name: 'Slack', icon: '💬' }, { name: 'GitHub', icon: '🐙' },
              { name: 'Figma', icon: '🎨' }, { name: 'Google Drive', icon: '📁' },
              { name: 'Notion', icon: '📝' }, { name: 'Jira', icon: '🔵' },
              { name: 'Zoom', icon: '📹' }, { name: 'Linear', icon: '⚡' },
            ].map(i => (
              <div key={i.name} className="ob-integration-chip">
                <span style={{ fontSize: 18 }}>{i.icon}</span> {i.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="ob-section-sm">
        <div className="ob-container">
          <div style={{
            borderRadius: 28, padding: 64,
            background: 'linear-gradient(135deg, rgba(124,110,255,0.22) 0%, rgba(168,85,247,0.16) 50%, rgba(6,214,247,0.10) 100%)',
            border: '1px solid var(--ob-border-2)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div aria-hidden style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,110,255,0.3), transparent)', filter: 'blur(40px)' }} />
            <div aria-hidden style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,214,247,0.2), transparent)', filter: 'blur(40px)' }} />
            <div style={{ color: 'var(--ob-primary)', display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <OrbitIcon size={52} />
            </div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Get started with <span className="ob-gradient-text">Orbit Workspace</span> today
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--ob-text-muted)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
              Join thousands of teams who use Orbit to move faster, collaborate better, and build extraordinary things.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/register" className="ob-btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                Start for free <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="ob-btn-ghost" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--ob-border)', background: 'var(--ob-surface)', padding: '56px 0 32px' }}>
        <div className="ob-container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ob-text)', marginBottom: 16 }}>
                <div style={{ color: 'var(--ob-primary)' }}><OrbitIcon size={28} /></div>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem' }}>
                  Orbit <span style={{ color: 'var(--ob-primary)' }}>Workspace</span>
                </span>
              </Link>
              <p style={{ fontSize: '0.85rem', color: 'var(--ob-text-muted)', lineHeight: 1.7, maxWidth: 260 }}>
                All your projects, tasks, and team in one intelligent orbit. Built for ambitious teams.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Community', 'Status', 'Contact'] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--ob-text)', marginBottom: 16 }}>{col.title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(l => (
                    <a key={l} href="#" className="ob-text-link" style={{ fontSize: '0.85rem' }}>{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--ob-border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--ob-text-faint)' }}>© {new Date().getFullYear()} Orbit Workspace. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <a key={l} href="#" className="ob-faint-link">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
