'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { User, Mail, Lock, Loader2, ArrowRight, ArrowLeft, Layers } from 'lucide-react';
import api from '@/lib/axios';
import { AxiosError } from 'axios';
import { setCredentials } from '@/store/slices/authSlice';
import { saveAuthTokens } from '@/lib/tokenStorage';
import { signInWithGoogle } from '@/lib/firebase';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const nextPath = searchParams.get('next') || '';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { user } = response.data;

      saveAuthTokens(user);
      dispatch(setCredentials({ user }));

      const destination = nextPath && nextPath.startsWith('/') ? nextPath : user.role === 'admin' ? '/admin_features/dashboard' : '/user_features/dashboard';
      router.push(destination);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const response = axiosError.response?.data as any;
      const validationMessage = response?.errors?.map((err: any) => err.msg).join(' ');
      const message = validationMessage || response?.message || (error instanceof Error ? error.message : 'Failed to register');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { user: gUser } = await signInWithGoogle();
      const response = await api.post('/auth/google', {
        email: gUser.email,
        displayName: gUser.displayName,
        photoURL: gUser.photoURL,
      });
      const { user } = response.data;
      saveAuthTokens(user);
      dispatch(setCredentials({ user }));

      const destination = nextPath && nextPath.startsWith('/') ? nextPath : user.role === 'admin' ? '/admin_features/dashboard' : '/user_features/dashboard';
      router.push(destination);
    } catch (err: any) {
      console.error('Google registration failed:', err);
      setError(err?.response?.data?.message || err?.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08090d] p-4 py-12 text-white sm:p-6">

      {/* Back Button — floating top-left */}
      <Link
        href="/homepage"
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium transition-all duration-200 backdrop-blur-md group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline">Back</span>
      </Link>

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#11131b] p-6 shadow-2xl shadow-[#3d35a0]/20 sm:p-8">

        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[50px]"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-[50px]"></div>

        <div className="relative z-10">
          <div className="text-center mb-6 sm:mb-8">
            {/* Clickable logo → back to homepage */}
            <Link
              href="/homepage"
              className="inline-flex items-center justify-center gap-2 mb-2 group"
            >
              <Layers className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 group-hover:from-blue-300 group-hover:to-purple-300 transition-all">
                Join Orbit
              </h1>
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm">Create an account to supercharge your productivity.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 placeholder-gray-500"
                  placeholder="cooluser"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 placeholder-gray-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 placeholder-gray-500"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 group w-full py-3 px-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-medium transition-all duration-300 shadow-[0_0_20px_rgba(120,119,198,0.3)] hover:shadow-[0_0_30px_rgba(120,119,198,0.5)] flex items-center justify-center gap-2 relative overflow-hidden"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-xs text-gray-500 uppercase font-medium">Or continue with</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="mt-6 w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#08090d]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
