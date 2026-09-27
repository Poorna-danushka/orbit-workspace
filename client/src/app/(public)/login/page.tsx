'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import {
  Mail, Lock, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff,
  ShieldCheck, Zap, BarChart3, CheckCircle2, Sparkles, Layers
} from 'lucide-react';
import api from '@/lib/axios';
import { setCredentials } from '@/store/slices/authSlice';
import { saveAuthTokens } from '@/lib/tokenStorage';
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

/* ─── Command Center Live Preview Widget ───────────────── */
function InteractiveLoginPreview() {
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
      {/* Glow background accent inside widget */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--ob-cyan-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--ob-auth-widget-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'var(--ob-auth-widget-card-bg)',
            border: '1px solid var(--ob-auth-widget-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ob-primary)'
          }}>
            <Layers size={16} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--ob-auth-panel-text)', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.01em' }}>
              Q4 Product Sprint
            </p>
            <p style={{ fontSize: 10, color: 'var(--ob-auth-panel-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>12 Active Tasks</span> • <span>4 Teammates</span>
            </p>
          </div>
        </div>

        <span style={{
          fontSize: 10,
          background: 'rgba(34,211,160,0.12)',
          color: 'var(--ob-success)',
          border: '1px solid rgba(34,211,160,0.25)',
          padding: '4px 10px',
          borderRadius: 99,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ob-success)', animation: 'pulse-ring 2s infinite' }} />
          ON TRACK
        </span>
      </div>

      {/* Progress Bar & Velocity Row */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ob-auth-panel-muted)' }}>Sprint Velocity</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ob-cyan)', fontFamily: 'Space Grotesk, sans-serif' }}>88% Completed</span>
        </div>
        <div style={{ width: '100%', height: 6, background: 'var(--ob-auth-widget-card-bg)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, var(--ob-primary) 0%, var(--ob-cyan) 100%)', borderRadius: 99 }} />
        </div>
      </div>

      {/* Live Activity Notification */}
      <div style={{
        background: 'var(--ob-auth-widget-card-bg)',
        border: '1px solid var(--ob-auth-widget-border)',
        borderRadius: 12,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--ob-primary), var(--ob-violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0
        }}>
          <Sparkles size={14} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ob-auth-panel-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Auth UI Redesign Completed
          </p>
          <p style={{ fontSize: 10, color: 'var(--ob-auth-panel-muted)' }}>Just now • Syncing with Main Branch</p>
        </div>
        <CheckCircle2 size={15} style={{ color: 'var(--ob-success)', flexShrink: 0 }} />
      </div>
    </div>
  );
}

/* ─── Main Login Form ─────────────────────────────────────────────── */
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const nextPath = searchParams.get('next') || '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user } = response.data;
      saveAuthTokens(user);
      dispatch(setCredentials({ user }));
      const destination = nextPath && nextPath.startsWith('/') ? nextPath : user.role === 'admin' ? '/admin' : '/dashboard';
      router.push(destination);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to login';
      setError((err as any)?.response?.data?.message || message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { user: gUser } = await signInWithGoogle();
      const response = await api.post('/auth/google', {
        email: gUser.email,
        displayName: gUser.displayName,
        photoURL: gUser.photoURL,
      });
      const { user } = response.data;
      saveAuthTokens(user);
      dispatch(setCredentials({ user }));
      const destination = nextPath && nextPath.startsWith('/') ? nextPath : user.role === 'admin' ? '/admin' : '/dashboard';
      router.push(destination);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', width: '100%', overflow: 'hidden', background: 'var(--ob-bg)' }}>

      {/* ── LEFT PANEL — BRAND SHOWCASE ───────────────────────────── */}
      <div style={{
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
        {/* Ambient Grid Lines Background */}
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
        <div aria-hidden style={{ position: 'absolute', top: '-10%', left: '-15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, var(--ob-primary-glow) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: '-10%', right: '-15%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, var(--ob-cyan-glow) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* Top Logo Header */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', zIndex: 2, flexShrink: 0, width: 'fit-content' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--ob-auth-widget-card-bg)',
            border: '1px solid var(--ob-auth-widget-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--ob-shadow-glow)',
            color: 'var(--ob-primary)',
          }}>
            <OrbitIcon size={24} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'var(--ob-auth-panel-text)', letterSpacing: '-0.02em' }}>Orbit</span>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'var(--ob-primary)', letterSpacing: '-0.02em' }}>Workspace</span>
            <span style={{ fontSize: 9, background: 'var(--ob-auth-widget-card-bg)', color: 'var(--ob-primary-lt)', border: '1px solid var(--ob-auth-widget-border)', padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>
              v2.4
            </span>
          </div>
        </Link>

        {/* Main Center Content */}
        <div style={{ zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '28px 0' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 100,
            background: 'var(--ob-auth-widget-card-bg)', border: '1px solid var(--ob-auth-widget-border)',
            marginBottom: 20, width: 'fit-content',
          }}>
            <Sparkles size={13} style={{ color: 'var(--ob-primary)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--ob-auth-panel-muted)', fontWeight: 600, letterSpacing: '0.02em' }}>
              Welcome back
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(2rem, 3vw, 2.8rem)',
            fontWeight: 800, color: 'var(--ob-auth-panel-text)',
            lineHeight: 1.15, letterSpacing: '-0.035em',
            marginBottom: 14,
          }}>
            Pick up where{' '}
            <span className="ob-gradient-text">
              you left off.
            </span>
          </h1>

          <p style={{ fontSize: '0.9rem', color: 'var(--ob-auth-panel-muted)', lineHeight: 1.65, maxWidth: 380, marginBottom: 32 }}>
            Your sprints, team collaboration, and real-time project metrics are ready for action.
          </p>

          {/* Interactive Mockup Component */}
          <InteractiveLoginPreview />

          {/* Key Benefit Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 32 }}>
            {[
              { icon: Zap, text: 'Instant Sync', color: 'var(--ob-primary)' },
              { icon: BarChart3, text: 'Live Analytics', color: 'var(--ob-cyan)' },
              { icon: ShieldCheck, text: 'Enterprise Security', color: 'var(--ob-success)' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <item.icon size={15} style={{ color: item.color }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--ob-auth-panel-muted)', fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Social Proof */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2, paddingTop: 20, borderTop: '1px solid var(--ob-auth-panel-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: 13, color: '#f59e0b' }}>★</span>)}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--ob-auth-panel-muted)', fontWeight: 600 }}>
              4.9/5 from 10,000+ teams
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--ob-auth-panel-faint)', fontWeight: 500 }}>
            Encrypted & Secure
          </span>
        </div>
      </div>

      {/* ── RIGHT PANEL — AUTH FORM ───────────────────────────────── */}
      <div style={{
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
        <div style={{ position: 'absolute', top: 24, right: 28, display: 'flex', alignItems: 'center', gap: 14, zIndex: 10 }}>
          <ThemeToggle />
          <Link href="/" className="ob-back-btn">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        <div className="ob-auth-form-card" style={{ width: '100%', maxWidth: 410 }}>
          {/* Form Header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800, fontSize: '2.1rem',
              color: 'var(--ob-text)',
              letterSpacing: '-0.035em', marginBottom: 8,
            }}>
              Sign in
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--ob-text-muted)', lineHeight: 1.5 }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" style={{ color: 'var(--ob-primary)', fontWeight: 700, textDecoration: 'none' }}>
                Create one free →
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
            id="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="ob-google-btn"
            style={{ height: 50 }}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Visual Divider */}
          <div className="ob-divider">
            <div className="ob-divider-line" />
            <span className="ob-divider-text">or sign in with email</span>
            <div className="ob-divider-line" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email Input */}
            <div className="ob-field">
              <label htmlFor="login-email" className="ob-label">Work Email</label>
              <div className="ob-field-inner">
                <Mail size={17} className="ob-field-icon" style={{ color: email ? 'var(--ob-primary)' : undefined }} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`ob-input-v2${email ? ' has-value' : ''}`}
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="ob-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label htmlFor="login-password" className="ob-label" style={{ margin: 0 }}>Password</label>
                <Link
                  href="/forgot-password"
                  style={{ fontSize: '0.8rem', color: 'var(--ob-primary)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="ob-field-inner">
                <Lock size={17} className="ob-field-icon" style={{ color: password ? 'var(--ob-primary)' : undefined }} />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`ob-input-v2${password ? ' has-value' : ''}`}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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
            </div>

            {/* Remember Me Toggle */}
            <div className="ob-checkbox-row" style={{ marginTop: -2 }}>
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="ob-checkbox"
              />
              <label htmlFor="remember-me" className="ob-checkbox-label">
                Remember me on this device
              </label>
            </div>

            {/* Submit Action Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="ob-btn-primary ob-auth-submit"
              style={{ marginTop: 4, height: 50 }}
            >
              {loading ? (
                <Loader2 size={20} style={{ animation: 'orbit-spin 1s linear infinite' }} />
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Terms */}
          <p className="ob-terms-text">
            By continuing, you agree to Orbit&apos;s{' '}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ob-bg)' }}>
        <div style={{ color: 'var(--ob-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <Loader2 size={36} style={{ animation: 'orbit-spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--ob-text-muted)', fontWeight: 500 }}>Loading Orbit...</span>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
