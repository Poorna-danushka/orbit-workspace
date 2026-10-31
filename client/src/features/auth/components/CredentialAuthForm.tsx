import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, Mail, User } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ROUTES } from '@/lib/constants/routes';
import AuthAlert from './AuthAlert';
import AuthCard from './AuthCard';
import AuthField from './AuthField';
import PasswordField from './PasswordField';
import { GoogleIcon } from './GoogleIcon';
import { PasswordStrength } from './PasswordStrength';
import type useCredentialAuth from '../hooks/useCredentialAuth';

type CredentialAuthFormState = ReturnType<typeof useCredentialAuth>;

export default function CredentialAuthForm({ form }: { form: CredentialAuthFormState }) {
  const isLogin = form.variant === 'login';

  return (
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
      <div className="ob-auth-top-actions">
        <ThemeToggle compact />
        <Link href={ROUTES.home} className="ob-back-btn">
          <ArrowLeft size={14} /> {isLogin ? 'Back to Home' : 'Back'}
        </Link>
      </div>

      <AuthCard variant="panel">
        <div style={{ marginBottom: isLogin ? 28 : 26 }}>
          <h2
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800,
              fontSize: isLogin ? '2.1rem' : '2rem',
              color: 'var(--ob-text)',
              letterSpacing: '-0.035em',
              marginBottom: 8,
            }}
          >
            {isLogin ? 'Sign in' : 'Create account'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ob-text-muted)', lineHeight: 1.5 }}>
            {isLogin ? (
              <>
                Don&apos;t have an account?{' '}
                <Link
                  href={ROUTES.register}
                  style={{ color: 'var(--ob-primary)', fontWeight: 700, textDecoration: 'none' }}
                >
                  Create one free →
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link
                  href={ROUTES.login}
                  style={{ color: 'var(--ob-primary)', fontWeight: 700, textDecoration: 'none' }}
                >
                  Sign in →
                </Link>
              </>
            )}
          </p>
        </div>

        <AuthAlert message={form.error} variant="panel" />

        <button
          id={isLogin ? 'login-google-btn' : 'register-google-btn'}
          onClick={form.handleGoogleLogin}
          disabled={form.loading}
          type="button"
          className="ob-google-btn"
          style={{ height: 50 }}
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        <div className="ob-divider">
          <div className="ob-divider-line" />
          <span className="ob-divider-text">
            {isLogin ? 'or sign in with email' : 'or sign up with email'}
          </span>
          <div className="ob-divider-line" />
        </div>

        <form
          onSubmit={form.handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: isLogin ? 18 : 16 }}
        >
          {!isLogin && (
            <AuthField
              id="reg-username"
              label="Username"
              icon={User}
              type="text"
              value={form.username}
              onChange={form.setUsername}
              placeholder="cooluser"
              autoComplete="username"
              variant="panel"
            />
          )}
          <AuthField
            id={isLogin ? 'login-email' : 'reg-email'}
            label={isLogin ? 'Work Email' : 'Email Address'}
            icon={Mail}
            type="email"
            value={form.email}
            onChange={form.setEmail}
            placeholder={isLogin ? 'name@company.com' : 'you@company.com'}
            autoComplete="email"
            variant="panel"
          />
          <div>
            <PasswordField
              id={isLogin ? 'login-password' : 'reg-password'}
              label="Password"
              value={form.password}
              onChange={form.setPassword}
              placeholder={isLogin ? '••••••••' : 'Min 8 characters'}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={isLogin ? undefined : 8}
              variant="panel"
              labelAccessory={
                isLogin ? (
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
                ) : undefined
              }
            />
            {!isLogin && form.password.length > 0 && <PasswordStrength password={form.password} />}
          </div>

          {isLogin && (
            <div className="ob-checkbox-row" style={{ marginTop: -2 }}>
              <input
                type="checkbox"
                id="remember-me"
                checked={form.rememberMe}
                onChange={(event) => form.setRememberMe(event.target.checked)}
                className="ob-checkbox"
              />
              <label htmlFor="remember-me" className="ob-checkbox-label">
                Remember me on this device
              </label>
            </div>
          )}

          <button
            id={isLogin ? 'login-submit-btn' : 'register-submit-btn'}
            type="submit"
            disabled={form.loading}
            className="ob-btn-primary ob-auth-submit"
            style={{ marginTop: isLogin ? 4 : 6, height: 50 }}
          >
            {form.loading ? (
              <Loader2 size={20} style={{ animation: 'orbit-spin 1s linear infinite' }} />
            ) : (
              <>
                <span>{isLogin ? 'Sign In to Workspace' : 'Create Free Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="ob-terms-text">
          {isLogin ? "By continuing, you agree to Orbit's" : "By signing up, you agree to Orbit's"}{' '}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </p>
      </AuthCard>
    </div>
  );
}
