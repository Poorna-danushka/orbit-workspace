'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import OrbitIcon from '@/features/auth/components/OrbitIcon';
import { ROUTES } from '@/lib/constants/routes';

export default function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* FLOATING GLASS NAVBAR */}
      <div className="ob-nav-wrapper">
        <nav className={`ob-nav ${scrolled ? 'scrolled' : ''}`}>
          {/* Brand Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: 'var(--ob-text)',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(124,110,255,0.35), rgba(6,214,247,0.25))',
                border: '1px solid var(--ob-border-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ob-primary)',
                boxShadow: '0 4px 14px rgba(124,110,255,0.28)',
                transition: 'transform 0.25s ease',
              }}
            >
              <OrbitIcon size={22} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  color: 'var(--ob-text)',
                  letterSpacing: '-0.02em',
                }}
              >
                Orbit
              </span>
              <span
                className="ob-brand-secondary"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  color: 'var(--ob-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Workspace
              </span>
              <span
                className="ob-brand-status"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--ob-success)',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
                title="All Systems Operational"
              />
            </div>
          </Link>

          {/* Navigation Links — Desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="ob-desktop-nav">
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 12 }}>
              <a href="#features" className="ob-nav-link">
                Features
              </a>
              <a href="#solutions" className="ob-nav-link">
                Solutions
              </a>
            </nav>
            <ThemeToggle compact />
            <Link
              href={ROUTES.login}
              className="ob-nav-link"
              style={{ fontWeight: 600, padding: '8px 18px' }}
            >
              Log in
            </Link>
            <Link
              href={ROUTES.register}
              className="ob-btn-primary"
              style={{
                padding: '9px 24px',
                fontSize: '0.88rem',
                borderRadius: 99,
                marginLeft: 8,
                boxShadow: '0 6px 24px rgba(124,110,255,0.38)',
              }}
            >
              <span>Get started free</span> <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Menu Controls */}
          <div className="ob-mobile-controls">
            <ThemeToggle compact />
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
              aria-expanded={mobileMenuOpen}
              aria-controls="landing-mobile-menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Glass Menu Drawer */}
      {mobileMenuOpen && (
        <div
          id="landing-mobile-menu"
          style={{
            position: 'fixed',
            top: 86,
            left: 16,
            right: 16,
            zIndex: 99,
            background: 'var(--ob-surface)',
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
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="ob-nav-link"
            style={{ padding: '12px 16px', fontSize: '1rem', width: '100%' }}
          >
            Features
          </a>
          <a
            href="#solutions"
            onClick={() => setMobileMenuOpen(false)}
            className="ob-nav-link"
            style={{ padding: '12px 16px', fontSize: '1rem', width: '100%' }}
          >
            Solutions
          </a>
          <div style={{ height: 1, background: 'var(--ob-border)', margin: '4px 0' }} />
          <Link
            href={ROUTES.login}
            onClick={() => setMobileMenuOpen(false)}
            className="ob-btn-ghost"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Log in
          </Link>
          <Link
            href={ROUTES.register}
            onClick={() => setMobileMenuOpen(false)}
            className="ob-btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>Get started free</span> <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </>
  );
}
