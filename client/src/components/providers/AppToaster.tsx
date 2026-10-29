'use client';

import { Toaster } from 'sonner';
import { useTheme } from './ThemeProvider';

export default function AppToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      richColors
      theme={theme === 'dark' ? 'dark' : 'light'}
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: 'border border-white/10 bg-[var(--ob-surface)] text-[var(--ob-text)]',
          title: 'text-[var(--ob-text)]',
          description: 'text-[var(--ob-text-muted)]',
          actionButton: 'bg-[var(--ob-accent)] text-white',
          cancelButton: 'bg-[var(--ob-surface-2)] text-[var(--ob-text)]',
        },
      }}
    />
  );
}
