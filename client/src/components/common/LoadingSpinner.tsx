'use client';

import { Layers, Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  variant?: 'default' | 'workspace' | 'admin';
}

export default function LoadingSpinner({ message = 'Loading...', variant = 'default' }: LoadingSpinnerProps) {
  if (variant === 'workspace') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)]">
              <Layers className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-purple-500/20 blur-sm animate-pulse" />
          </div>
          <p className="text-gray-500 text-sm font-medium">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === 'admin') {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center animate-pulse">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
          <p className="text-gray-400 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}
