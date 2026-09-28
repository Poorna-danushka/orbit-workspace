'use client';

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
const THEME_EVENT = 'orbit-theme-change';

function readPreferredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem('orbit-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getThemeSnapshot(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function subscribeToTheme(listener: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== 'orbit-theme') return;
    document.documentElement.setAttribute('data-theme', readPreferredTheme());
    listener();
  };

  window.addEventListener(THEME_EVENT, listener);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}

function getServerThemeSnapshot(): Theme {
  return 'dark';
}

function setDocumentTheme(theme: Theme, persist: boolean): void {
  document.documentElement.setAttribute('data-theme', theme);
  if (persist) {
    try {
      window.localStorage.setItem('orbit-theme', theme);
    } catch {
      // The theme still applies to this page when browser storage is unavailable.
    }
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: 'dark', toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => {
    setDocumentTheme(readPreferredTheme(), false);
  }, []);

  const toggle = () => {
    setDocumentTheme(theme === 'dark' ? 'light' : 'dark', true);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
