'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import {
  User, Mail, Lock, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff, Check,
  Rocket, Users, ShieldCheck, Sparkles, Star
} from 'lucide-react';
import api from '@/lib/axios';
import { getAuthErrorMessage } from '@/lib/authError';
import { setCredentials } from '@/store/slices/authSlice';
import { saveAuthTokens } from '@/lib/tokenStorage';
import { getPostAuthPath } from '@/lib/authNavigation';
import { signInWithGoogle } from '@/lib/firebase';
import ThemeToggle from '@/components/ui/ThemeToggle';
import OrbitIcon from '@/components/auth/OrbitIcon';

/* ─── Google SVG Icon ─────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ─── Password Strength Evaluator ────────────────────────────────── */
const PWD_CHECKS = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains letter', test: (p: string) => /[a-zA-Z]/.test(p) },
];

const STRENGTH_COLOR = ['transparent', '#f43f5e', '#f59e0b', '#22d3a0'];
const STRENGTH_LABEL = ['', 'Weak', 'Good', 'Strong'];

function PasswordStrength({ password }: { password: string }) {
  const passed = PWD_CHECKS.filter(c => c.test(password)).length;
  return (
    <div className="ob-pwd-strength">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--ob-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Password Strength
        </span>
        <span style={{
          fontSize: '0.72rem', fontWeight: 700,
          color: passed === 0 ? 'var(--ob-text-faint)' : STRENGTH_COLOR[passed],
          transition: 'color 0.3s',
        }}>
          {passed === 0 ? 'Required' : STRENGTH_LABEL[passed]}
        </span>
      </div>
      <div className="ob-pwd-bar-track">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="ob-pwd-bar-segment"
            style={{ background: i < passed ? STRENGTH_COLOR[passed] : 'var(--ob-surface-3)' }}
          />
        ))}
      </div>
      <div className="ob-pwd-checks">
        {PWD_CHECKS.map(c => {
          const ok = c.test(password);
          return (
            <span key={c.label} className="ob-pwd-check" style={{ color: ok ? '#22d3a0' : 'var(--ob-text-faint)' }}>
              <Check size={11} style={{ opacity: ok ? 1 : 0.35, transition: 'opacity 0.25s' }} />
              {c.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Workspace Setup Live Preview Widget ──────────────── */
function InteractiveRegisterPreview() {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: '22px 24px',
        background: 'var(--ob-auth-widget-bg)',
        boxShadow: 'var(--ob-shadow)',
        border: '1px solid var(--ob-auth-widget-border)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(30px)',
      }}
    >
      {/* Background radial glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -30,
          left: -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--ob-primary-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--ob-auth-widget-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'var(--ob-auth-widget-card-bg)',
            border: '1px solid var(--ob-auth-widget-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ob-cyan)'
          }}>
            <Rocket size={16} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--ob-auth-panel-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Free Tier Workspace
            </p>
            <p style={{ fontSize: 10, color: 'var(--ob-auth-panel-muted)' }}>Instant Setup • No Credit Card</p>
          </div>
        </div>

        <span style={{
          fontSize: 10,
          background: 'var(--ob-auth-widget-card-bg)',
          color: 'var(--ob-cyan)',
          border: '1px solid var(--ob-auth-widget-border)',
          padding: '4px 10px',
          borderRadius: 99,
          fontWeight: 700,
        }}>
          UNLIMITED
        </span>
      </div>

      {/* Setup Checklist Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {[
          { text: 'Create workspace URL & domain', done: true },
          { text: 'Invite team members for free', done: true },
          { text: 'Connect GitHub, Slack & Figma', done: false },
        ].map((step, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: step.done ? 'var(--ob-auth-panel-text)' : 'var(--ob-auth-panel-muted)' }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: step.done ? 'rgba(34,211,160,0.18)' : 'var(--ob-auth-widget-card-bg)',
              border: step.done ? '1px solid var(--ob-success)' : '1px solid var(--ob-auth-widget-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ob-success)', flexShrink: 0
            }}>
              {step.done ? <Check size={11} /> : <span style={{ fontSize: 9, color: 'var(--ob-auth-panel-faint)' }}>{idx + 1}</span>}
            </div>
            <span style={{ fontWeight: step.done ? 600 : 400 }}>{step.text}</span>
          </div>
        ))}
      </div>

      {/* Customer Testimonial Card */}
      <div style={{
        background: 'var(--ob-auth-widget-card-bg)',
        border: '1px solid var(--ob-auth-widget-border)',
        borderRadius: 12,
        padding: '12px 14px',
      }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--ob-auth-panel-text)', lineHeight: 1.5, fontStyle: 'italic', marginBottom: 8 }}>
          &ldquo;We shipped 3x faster in our first month with Orbit. The workflow friction simply vanished.&rdquo;
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--ob-cyan), var(--ob-primary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: '#fff'
            }}>S</div>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ob-auth-panel-text)', lineHeight: 1 }}>Sarah K.</p>
              <p style={{ fontSize: '0.68rem', color: 'var(--ob-auth-panel-muted)' }}>CTO at TechFlow</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 1 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={11} style={{ fill: '#f59e0b', color: '#f59e0b' }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Register Form ─────────────────────────────────────────── */
function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const nextPath = searchParams.get('next') || '';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { user } = response.data;
      saveAuthTokens(user);
      dispatch(setCredentials({ user }));
      router.replace(getPostAuthPath(user.role, nextPath));
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, 'Failed to register'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { idToken } = await signInWithGoogle();
      const response = await api.post('/auth/google', { idToken });
      const { user } = response.data;
      saveAuthTokens(user);
      dispatch(setCredentials({ user }));
      router.replace(getPostAuthPath(user.role, nextPath));
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, 'Google authentication failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ob-auth-screen" style={{ display: 'flex', minHeight: '100dvh', width: '100%', overflow: 'hidden', background: 'var(--ob-bg)' }}>

      {/* ── LEFT PANEL — BRAND SHOWCASE ───────────────────────────── */}
      <div className="ob-auth-brand-panel" style={{
        flex: '0 0 44%',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--ob-auth-panel-bg)',
        borderRight: '1px solid var(--ob-auth-panel-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px 56px',
        boxSizing: 'border-box',
        height: '100dvh',
      }}>
        {/* Ambient Grid Background */}
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

        {/* Ambient Radial Glows */}
        <div aria-hidden style={{ position: 'absolute', top: '-10%', right: '-15%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, var(--ob-cyan-glow) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: '-10%', left: '-15%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, var(--ob-primary-glow) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* Top Logo Header */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', zIndex: 2, flexShrink: 0, width: 'fit-content' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--ob-auth-widget-card-bg)',
            border: '1px solid var(--ob-auth-widget-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--ob-shadow-glow)',
            color: 'var(--ob-cyan)',
          }}>
            <OrbitIcon size={24} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'var(--ob-auth-panel-text)', letterSpacing: '-0.02em' }}>Orbit</span>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'var(--ob-cyan)', letterSpacing: '-0.02em' }}>Workspace</span>
            <span style={{ fontSize: 9, background: 'var(--ob-auth-widget-card-bg)', color: 'var(--ob-cyan)', border: '1px solid var(--ob-auth-widget-border)', padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>
              FREE
            </span>
          </div>
        </Link>

        {/* Center Content */}
        <div style={{ zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 0' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 100,
            background: 'var(--ob-auth-widget-card-bg)', border: '1px solid var(--ob-auth-widget-border)',
            marginBottom: 20, width: 'fit-content',
          }}>
            <Sparkles size={13} style={{ color: 'var(--ob-cyan)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--ob-auth-panel-muted)', fontWeight: 600, letterSpacing: '0.02em' }}>
              Free to start
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(2rem, 3vw, 2.7rem)',
            fontWeight: 800, color: 'var(--ob-auth-panel-text)',
            lineHeight: 1.15, letterSpacing: '-0.035em',
            marginBottom: 12,
          }}>
            Join 10,000+ teams{' '}
            <span className="ob-gradient-text">
              in orbit.
            </span>
          </h1>

          <p style={{ fontSize: '0.88rem', color: 'var(--ob-auth-panel-muted)', lineHeight: 1.65, maxWidth: 360, marginBottom: 28 }}>
            Free workspace. No credit card needed. Set up your team in seconds.
          </p>

          {/* Interactive Mockup Component */}
          <InteractiveRegisterPreview />

          {/* Feature highlights */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 28 }}>
            {[
              { icon: Rocket, text: 'Fast Setup', color: 'var(--ob-primary)' },
              { icon: Users, text: 'Free Team Invites', color: 'var(--ob-cyan)' },
              { icon: ShieldCheck, text: 'Enterprise Security', color: 'var(--ob-success)' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <item.icon size={15} style={{ color: item.color }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--ob-auth-panel-muted)', fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2, paddingTop: 18, borderTop: '1px solid var(--ob-auth-panel-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: 13, color: '#f59e0b' }}>★</span>)}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--ob-auth-panel-muted)', fontWeight: 600 }}>
              Rated 4.9/5 · 10k+ teams
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--ob-auth-panel-faint)', fontWeight: 500 }}>
            SOC2 Compliant
          </span>
        </div>
      </div>

      {/* ── RIGHT PANEL — AUTH FORM ───────────────────────────────── */}
      <div className="ob-auth-content-panel" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '36px 48px',
        background: 'var(--ob-bg)',
        position: 'relative',
        height: '100dvh',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}>
        {/* Top Action Bar */}
        <div className="ob-auth-top-actions">
          <ThemeToggle compact />
          <Link href="/" className="ob-back-btn">
            <ArrowLeft size={14} /> Back
          </Link>
        </div>

        <div className="ob-auth-form-card" style={{ width: '100%', maxWidth: 410 }}>
          {/* Header */}
          <div style={{ marginBottom: 26 }}>
            <h2 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800, fontSize: '2rem',
              color: 'var(--ob-text)',
              letterSpacing: '-0.035em', marginBottom: 8,
            }}>
              Create account
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--ob-text-muted)', lineHeight: 1.5 }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--ob-primary)', fontWeight: 700, textDecoration: 'none' }}>
                Sign in →
              </Link>
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="ob-error-alert" role="alert">
              <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            id="register-google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="ob-google-btn"
            style={{ height: 50 }}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="ob-divider">
            <div className="ob-divider-line" />
            <span className="ob-divider-text">or sign up with email</span>
            <div className="ob-divider-line" />
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Username Input */}
            <div className="ob-field">
              <label htmlFor="reg-username" className="ob-label">Username</label>
              <div className="ob-field-inner">
                <User size={17} className="ob-field-icon" style={{ color: username ? 'var(--ob-primary)' : undefined }} />
                <input
                  id="reg-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className={`ob-input-v2${username ? ' has-value' : ''}`}
                  placeholder="cooluser"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="ob-field">
              <label htmlFor="reg-email" className="ob-label">Email Address</label>
              <div className="ob-field-inner">
                <Mail size={17} className="ob-field-icon" style={{ color: email ? 'var(--ob-primary)' : undefined }} />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`ob-input-v2${email ? ' has-value' : ''}`}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="ob-field">
              <label htmlFor="reg-password" className="ob-label">Password</label>
              <div className="ob-field-inner">
                <Lock size={17} className="ob-field-icon" style={{ color: password ? 'var(--ob-primary)' : undefined }} />
                <input
                  id="reg-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`ob-input-v2${password ? ' has-value' : ''}`}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="ob-input-action"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Live Strength Meter */}
              {password.length > 0 && <PasswordStrength password={password} />}
            </div>

            {/* Submit Action Button */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="ob-btn-primary ob-auth-submit"
              style={{ marginTop: 6, height: 50 }}
            >
              {loading ? (
                <Loader2 size={20} style={{ animation: 'orbit-spin 1s linear infinite' }} />
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Terms Footer */}
          <p className="ob-terms-text">
            By signing up, you agree to Orbit&apos;s{' '}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ob-bg)' }}>
        <div style={{ color: 'var(--ob-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <Loader2 size={36} style={{ animation: 'orbit-spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--ob-text-muted)', fontWeight: 500 }}>Setting up Orbit...</span>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
