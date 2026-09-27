'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: '1px solid var(--ob-border-2)',
        background: 'var(--ob-surface-2)',
        color: 'var(--ob-text-muted)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--ob-primary)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ob-primary)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--ob-text-muted)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ob-border-2)';
      }}
    >
      {theme === 'dark'
        ? <Sun size={16} />
        : <Moon size={16} />
      }
    </button>
  );
}
