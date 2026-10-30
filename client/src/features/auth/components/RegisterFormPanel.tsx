import Link from 'next/link';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { GoogleIcon } from './GoogleIcon';
import { PasswordStrength } from './PasswordStrength';
import { ROUTES } from '@/lib/constants/routes';

interface RegisterFormPanelProps {
  username: string;
  email: string;
  password: string;
  showPwd: boolean;
  loading: boolean;
  error: string;
  setUsername: Dispatch<SetStateAction<string>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  setShowPwd: Dispatch<SetStateAction<boolean>>;
  handleRegister: (event: React.FormEvent<HTMLFormElement>) => void;
  handleGoogleLogin: () => void;
}

export default function RegisterFormPanel({
  username,
  email,
  password,
  showPwd,
  loading,
  error,
  setUsername,
  setEmail,
  setPassword,
  setShowPwd,
  handleRegister,
  handleGoogleLogin,
}: RegisterFormPanelProps) {
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
            <ArrowLeft size={14} /> Back
          </Link>
        </div>

        <div className="ob-auth-form-card" style={{ width: '100%', maxWidth: 410 }}>
          {/* Header */}
          <div style={{ marginBottom: 26 }}>
            <h2
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 800,
                fontSize: '2rem',
                color: 'var(--ob-text)',
                letterSpacing: '-0.035em',
                marginBottom: 8,
              }}
            >
              Create account
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--ob-text-muted)', lineHeight: 1.5 }}>
              Already have an account?{' '}
              <Link
                href={ROUTES.login}
                style={{ color: 'var(--ob-primary)', fontWeight: 700, textDecoration: 'none' }}
              >
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
          <form
            onSubmit={handleRegister}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Username Input */}
            <div className="ob-field">
              <label htmlFor="reg-username" className="ob-label">
                Username
              </label>
              <div className="ob-field-inner">
                <User
                  size={17}
                  className="ob-field-icon"
                  style={{ color: username ? 'var(--ob-primary)' : undefined }}
                />
                <input
                  id="reg-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`ob-input-v2${username ? ' has-value' : ''}`}
                  placeholder="cooluser"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="ob-field">
              <label htmlFor="reg-email" className="ob-label">
                Email Address
              </label>
              <div className="ob-field-inner">
                <Mail
                  size={17}
                  className="ob-field-icon"
                  style={{ color: email ? 'var(--ob-primary)' : undefined }}
                />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`ob-input-v2${email ? ' has-value' : ''}`}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="ob-field">
              <label htmlFor="reg-password" className="ob-label">
                Password
              </label>
              <div className="ob-field-inner">
                <Lock
                  size={17}
                  className="ob-field-icon"
                  style={{ color: password ? 'var(--ob-primary)' : undefined }}
                />
                <input
                  id="reg-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`ob-input-v2${password ? ' has-value' : ''}`}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
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
            By signing up, you agree to Orbit&apos;s <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </>
  );
}
