'use client';

import Link from 'next/link';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import LandingNav from './LandingNav';
import { OrbitalAnimation } from './OrbitalAnimation';
import { StarField } from './StarField';
import LandingSections from './LandingSections';

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--ob-bg)',
        color: 'var(--ob-text)',
        overflowX: 'hidden',
      }}
    >
      <LandingNav />

      {/* HERO SECTION */}
      <section
        className="ob-hero-section"
        style={{
          position: 'relative',
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: 95,
          paddingBottom: 40,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <StarField />
        <div
          aria-hidden
          className="ob-hero-glow"
          style={{
            position: 'absolute',
            top: '10%',
            left: '-5%',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,110,255,0.14) 0%, transparent 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          className="ob-hero-glow"
          style={{
            position: 'absolute',
            bottom: '5%',
            right: '-5%',
            width: 550,
            height: 550,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,214,247,0.12) 0%, transparent 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />

        <div className="ob-container" style={{ width: '100%', position: 'relative', zIndex: 5 }}>
          <div
            className="ob-hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'var(--ob-hero-columns, repeat(auto-fit, minmax(320px, 1fr)))',
              gap: 'var(--ob-hero-gap, 40px 60px)',
              alignItems: 'center',
            }}
          >
            {/* LEFT COLUMN: HERO ACTION & CONTENT */}
            <div
              className="ob-hero-copy"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
            >
              {/* Hero badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 18px',
                  borderRadius: 100,
                  border: '1px solid var(--ob-border-2)',
                  background: 'var(--ob-surface-2)',
                  marginBottom: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--ob-success)',
                    display: 'inline-block',
                    animation: 'pulse-ring 2s infinite',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{ fontSize: '0.82rem', color: 'var(--ob-text-muted)', fontWeight: 500 }}
                >
                  Command center for ambitious teams
                </span>
              </div>

              {/* Hero Headline */}
              <h1
                className="ob-hero-heading"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 'var(--ob-hero-heading-size, clamp(2.6rem, 4.5vw, 4.2rem))',
                  fontWeight: 800,
                  lineHeight: 1.08,
                  letterSpacing: '-0.04em',
                  marginBottom: 20,
                }}
              >
                Your team&apos;s work, <span className="ob-gradient-text">in one orbit</span>
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
                  lineHeight: 1.7,
                  color: 'var(--ob-text-muted)',
                  maxWidth: 480,
                  marginBottom: 32,
                }}
              >
                Tasks, teammates, and tools — in perfect sync. Ship faster.
              </p>

              {/* CTA Action Bar */}
              <div
                className="ob-hero-cta"
                style={{ width: '100%', maxWidth: 500, marginBottom: 24 }}
              >
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link
                    href="/register"
                    className="ob-btn-primary"
                    style={{
                      height: 52,
                      fontSize: '1rem',
                      borderRadius: 99,
                      padding: '0 32px',
                      boxShadow: '0 8px 30px rgba(124,110,255,0.35)',
                    }}
                  >
                    Start for free <ArrowRight size={17} />
                  </Link>
                  <Link
                    href="/login"
                    className="ob-btn-ghost"
                    style={{ height: 52, fontSize: '1rem', borderRadius: 99, padding: '0 28px' }}
                  >
                    Sign in
                  </Link>
                </div>
              </div>

              {/* Feature Value Props Chips */}
              <div
                style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', marginBottom: 32 }}
              >
                {['Free forever', 'No card required', 'Any team size'].map((t) => (
                  <span
                    key={t}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.82rem',
                      color: 'var(--ob-text-muted)',
                      background: 'var(--ob-surface)',
                      padding: '4px 12px',
                      borderRadius: 20,
                      border: '1px solid var(--ob-border)',
                    }}
                  >
                    <Check size={13} style={{ color: 'var(--ob-success)' }} /> {t}
                  </span>
                ))}
              </div>

              {/* Quick Social Proof */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  paddingTop: 16,
                  borderTop: '1px solid var(--ob-border)',
                }}
              >
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ fontSize: 13, color: '#f59e0b' }}>
                      ★
                    </span>
                  ))}
                </div>
                <span
                  style={{ fontSize: '0.82rem', color: 'var(--ob-text-muted)', fontWeight: 500 }}
                >
                  <strong>4.9/5</strong> · 10,000+ teams
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: EYE-CATCHING ORBITAL ANIMATION */}
            <div
              className="ob-hero-visual"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <OrbitalAnimation />
            </div>
          </div>
        </div>

        <div
          className="ob-hero-scroll-hint"
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'orbit-float 2s ease-in-out infinite',
            color: 'var(--ob-text-faint)',
          }}
        >
          <ChevronDown size={22} />
        </div>
      </section>

      <LandingSections />
    </div>
  );
}
