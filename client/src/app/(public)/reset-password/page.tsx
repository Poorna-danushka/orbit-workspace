'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axios';
import { getAuthErrorMessage } from '@/lib/authError';
import ThemeToggle from '@/components/ui/ThemeToggle';
import OrbitIcon from '@/components/auth/OrbitIcon';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { setError('Reset token is missing from the URL.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters long.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, 'Failed to reset password. The link may have expired.'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#f43f5e' }}>
          <AlertCircle size={30} />
        </div>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: 'var(--ob-text)', marginBottom: 12 }}>Invalid Reset Link</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--ob-text-muted)', lineHeight: 1.7, marginBottom: 24 }}>
          No secure token was found in the URL. Please verify the link you clicked or request a new one.
        </p>
        <Link href="/forgot-password" className="ob-btn-ghost" style={{ display: 'inline-flex', justifyContent: 'center' }}>
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', animation: 'fadeInUp 0.5s ease' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,211,160,0.12)', border: '1px solid rgba(34,211,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#22d3a0' }}>
          <CheckCircle2 size={30} />
        </div>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: 'var(--ob-text)', marginBottom: 12 }}>Password updated!</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--ob-text-muted)', lineHeight: 1.7, marginBottom: 28 }}>
          Your password has been successfully reset. All active sessions have been signed out for your security.
        </p>
        <Link href="/login" className="ob-btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', borderRadius: 12, height: 48, fontSize: '0.9rem' }}>
          Proceed to Login <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ob-text)', marginBottom: 7 }}>New Password</label>
        <div style={{ position: 'relative' }}>
          <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ob-text-faint)', pointerEvents: 'none' }} />
          <input
            id="new-password"
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="ob-input"
            style={{ paddingRight: 48 }}
            placeholder="Min 8 characters"
            required
            autoComplete="new-password"
          />
          <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ob-text-faint)', padding: 0 }} aria-label={showPwd ? 'Hide' : 'Show'}>
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ob-text)', marginBottom: 7 }}>Confirm Password</label>
        <div style={{ position: 'relative' }}>
          <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ob-text-faint)', pointerEvents: 'none' }} />
          <input
            id="confirm-password"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="ob-input"
            style={{
              paddingRight: 48,
              borderColor: confirmPassword.length > 0 ? (confirmPassword === password ? 'rgba(34,211,160,0.5)' : 'rgba(244,63,94,0.5)') : undefined,
            }}
            placeholder="Confirm new password"
            required
            autoComplete="new-password"
          />
          <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ob-text-faint)', padding: 0 }} aria-label={showConfirm ? 'Hide' : 'Show'}>
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {confirmPassword.length > 0 && confirmPassword !== password && (
          <p style={{ fontSize: '0.78rem', color: '#f43f5e', marginTop: 5 }}>Passwords do not match</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="ob-btn-primary"
        style={{ width: '100%', height: 50, fontSize: '0.95rem', borderRadius: 12, justifyContent: 'center', marginTop: 4 }}
      >
        {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <><span>Set New Password</span><ArrowRight size={16} /></>}
      </button>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--ob-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      <div aria-hidden style={{ position: 'fixed', top: '10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,110,255,0.14) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'fixed', bottom: '10%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,214,247,0.10) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid var(--ob-border)', background: 'rgba(7,8,15,0.7)', backdropFilter: 'blur(20px)', zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--ob-text)' }}>
          <div style={{ color: 'var(--ob-primary)' }}><OrbitIcon size={24} /></div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--ob-text)' }}>Orbit <span style={{ color: 'var(--ob-primary)' }}>Workspace</span></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle compact />
          <Link href="/login" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            borderRadius: 10, border: '1px solid var(--ob-border-2)',
            background: 'var(--ob-surface-2)', color: 'var(--ob-text-muted)',
            textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ob-text)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ob-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ob-text-muted)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ob-border-2)'; }}
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 440,
        background: 'var(--ob-surface)',
        border: '1px solid var(--ob-border-2)',
        borderRadius: 24,
        padding: '40px 36px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,110,255,0.10)',
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(to right, transparent, rgba(124,110,255,0.7), transparent)' }} />
        <div aria-hidden style={{ position: 'absolute', top: -60, right: -60, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,110,255,0.15), transparent)', filter: 'blur(30px)', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--ob-primary)', marginBottom: 16 }}>
            <OrbitIcon size={40} />
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.7rem', color: 'var(--ob-text)', letterSpacing: '-0.02em', marginBottom: 8 }}>Choose a new password</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--ob-text-muted)', lineHeight: 1.6 }}>
            Enter and confirm your new secure password below.
          </p>
        </div>

        <Suspense fallback={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--ob-primary)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--ob-text-muted)' }}>Loading...</span>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
