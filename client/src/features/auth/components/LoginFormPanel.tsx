import Link from 'next/link';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { GoogleIcon } from './GoogleIcon';
import { ROUTES } from '@/lib/constants/routes';

interface LoginFormPanelProps {
  email: string;
  password: string;
  rememberMe: boolean;
  showPwd: boolean;
  loading: boolean;
  error: string;
  setEmail: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  setRememberMe: Dispatch<SetStateAction<boolean>>;
  setShowPwd: Dispatch<SetStateAction<boolean>>;
  handleLogin: (event: React.FormEvent<HTMLFormElement>) => void;
  handleGoogleLogin: () => void;
}

export default function LoginFormPanel({
  email,
  password,
  rememberMe,
  showPwd,
  loading,
  error,
  setEmail,
  setPassword,
  setRememberMe,
  setShowPwd,
  handleLogin,
  handleGoogleLogin,
}: LoginFormPanelProps) {
  return (
    <>
      {/* ── RIGHT PANEL — AUTH FORM ───────────────────────────────── */}
      <div
        className="ob-auth-content-panel"
        style={{
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
        }}
      >
        {/* Top Action Bar */}
        <div className="ob-auth-top-actions">
          <ThemeToggle compact />
          <Link href="/" className="ob-back-btn">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        <div className="ob-auth-form-card" style={{ width: '100%', maxWidth: 410 }}>
          {/* Form Header */}
          <div style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 800,
                fontSize: '2.1rem',
                color: 'var(--ob-text)',
                letterSpacing: '-0.035em',
                marginBottom: 8,
              }}
            >
              Sign in
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--ob-text-muted)', lineHeight: 1.5 }}>
              Don&apos;t have an account?{' '}
              <Link
                href={ROUTES.register}
                style={{ color: 'var(--ob-primary)', fontWeight: 700, textDecoration: 'none' }}
              >
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
          <form
            onSubmit={handleLogin}
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
          >
            {/* Email Input */}
            <div className="ob-field">
              <label htmlFor="login-email" className="ob-label">
                Work Email
              </label>
              <div className="ob-field-inner">
                <Mail
                  size={17}
                  className="ob-field-icon"
                  style={{ color: email ? 'var(--ob-primary)' : undefined }}
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`ob-input-v2${email ? ' has-value' : ''}`}
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="ob-field">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 7,
                }}
              >
                <label htmlFor="login-password" className="ob-label" style={{ margin: 0 }}>
                  Password
                </label>
                <Link
                  href={ROUTES.forgotPassword}
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--ob-primary)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="ob-field-inner">
                <Lock
                  size={17}
                  className="ob-field-icon"
                  style={{ color: password ? 'var(--ob-primary)' : undefined }}
                />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`ob-input-v2${password ? ' has-value' : ''}`}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
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
                onChange={(e) => setRememberMe(e.target.checked)}
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
            By continuing, you agree to Orbit&apos;s <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </>
  );
}
