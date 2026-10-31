import { Check } from 'lucide-react';

/* ─── Password Strength Evaluator ────────────────────────────────── */
const PWD_CHECKS = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains letter', test: (p: string) => /[a-zA-Z]/.test(p) },
];

const STRENGTH_COLOR = ['transparent', '#f43f5e', '#f59e0b', '#22d3a0'];
const STRENGTH_LABEL = ['', 'Weak', 'Good', 'Strong'];

export function PasswordStrength({ password }: { password: string }) {
  const passed = PWD_CHECKS.filter((c) => c.test(password)).length;
  return (
    <div className="ob-pwd-strength">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: '0.72rem',
            color: 'var(--ob-text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Password Strength
        </span>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: passed === 0 ? 'var(--ob-text-faint)' : STRENGTH_COLOR[passed],
            transition: 'color 0.3s',
          }}
        >
          {passed === 0 ? 'Required' : STRENGTH_LABEL[passed]}
        </span>
      </div>
      <div className="ob-pwd-bar-track">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="ob-pwd-bar-segment"
            style={{ background: i < passed ? STRENGTH_COLOR[passed] : 'var(--ob-surface-3)' }}
          />
        ))}
      </div>
      <div className="ob-pwd-checks">
        {PWD_CHECKS.map((c) => {
          const ok = c.test(password);
          return (
            <span
              key={c.label}
              className="ob-pwd-check"
              style={{ color: ok ? '#22d3a0' : 'var(--ob-text-faint)' }}
            >
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
