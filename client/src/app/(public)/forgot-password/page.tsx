'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import { getAuthErrorMessage } from '@/lib/authError';
import ThemeToggle from '@/components/ui/ThemeToggle';
import OrbitIcon from '@/components/auth/OrbitIcon';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, 'Failed to submit request'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--ob-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      <div aria-hidden style={{ position: 'fixed', top: '10%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,110,255,0.14) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'fixed', bottom: '10%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

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

        {success ? (
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.5s ease' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,211,160,0.12)', border: '1px solid rgba(34,211,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#22d3a0' }}>
              <CheckCircle2 size={30} />
            </div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: 'var(--ob-text)', marginBottom: 12, letterSpacing: '-0.02em' }}>Check your inbox</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--ob-text-muted)', lineHeight: 1.7, marginBottom: 20 }}>
              If an account exists for <strong style={{ color: 'var(--ob-text)' }}>{email}</strong>, a password reset link has been sent.
            </p>
            <div style={{ background: 'rgba(124,110,255,0.08)', border: '1px solid rgba(124,110,255,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 28, textAlign: 'left' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ob-primary)', marginBottom: 4 }}>💡 Developer Note</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--ob-text-muted)', lineHeight: 1.6 }}>
                Mock email delivery is active. Check the <strong>server backend terminal logs</strong> to retrieve the reset URL.
              </p>
            </div>
            <Link href="/login" className="ob-btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', borderRadius: 12, height: 48, fontSize: '0.9rem' }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--ob-primary)', marginBottom: 16 }}>
                <OrbitIcon size={40} />
              </div>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.7rem', color: 'var(--ob-text)', letterSpacing: '-0.02em', marginBottom: 8 }}>Reset your password</h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--ob-text-muted)', lineHeight: 1.6 }}>
                Enter your email and we&apos;ll send you a secure link to reset your password.
              </p>
            </div>

            {error && (
              <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ob-text)', marginBottom: 7 }}>Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ob-text-faint)', pointerEvents: 'none' }} />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="ob-input"
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="ob-btn-primary"
                style={{ width: '100%', height: 50, fontSize: '0.95rem', borderRadius: 12, justifyContent: 'center', opacity: (!email || loading) ? 0.6 : 1 }}
              >
                {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <><span>Send Reset Link</span><ArrowRight size={16} /></>}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link href="/login" style={{ fontSize: '0.85rem', color: 'var(--ob-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ob-primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ob-text-muted)'; }}
              >
                ← Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
