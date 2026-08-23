import Link from 'next/link';
import { ArrowRight, Layout, Zap, BarChart2, Layers } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen min-h-[100svh] bg-[#0a0a0a] text-white selection:bg-purple-500/30 flex flex-col overflow-x-hidden">

      {/* Dynamic Background — fixed, covers full viewport */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-[15%] right-[-10%] w-[50%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>

      {/* Navbar — sticky, full-width, glass effect */}
      <nav className="sticky top-0 z-20 w-full shrink-0 bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3 sm:py-4 max-w-7xl mx-auto w-full">
          <Link href="/homepage" className="flex items-center gap-2 min-w-0 group">
            <Layers className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400 group-hover:text-purple-300 transition-colors shrink-0" />
            <span className="text-base sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 whitespace-nowrap group-hover:from-purple-300 group-hover:to-blue-300 transition-all">
              Orbit
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-colors px-2 py-1"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all backdrop-blur-md whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-purple-300 mb-6 sm:mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse"></span>
          <span>Next-Generation Project Workspace</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-[1.15] px-2">
          Manage projects with
          <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400">
            seamless collaboration
          </span>
        </h1>

        <p className="text-sm sm:text-lg md:text-xl text-gray-400 max-w-2xl mb-8 sm:mb-12 leading-relaxed px-2">
          Orbit is a modern, high-performance workspace designed for fast-moving teams. Manage projects, track tasks, and collaborate effortlessly in real-time.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="group px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white text-black font-semibold text-base sm:text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            Start for free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/5 border border-white/10 font-semibold text-base sm:text-lg hover:bg-white/10 transition-all backdrop-blur-sm text-center flex items-center justify-center"
          >
            View Live Demo
          </Link>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20 md:pb-24 pt-4 sm:pt-8 w-full">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">

          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
              <Layout className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Intuitive Kanban</h3>
            <p className="text-gray-400 leading-relaxed text-sm">Drag and drop tasks effortlessly. Organize your workflow visually with our lightning-fast board system.</p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
              <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Productivity Analytics</h3>
            <p className="text-gray-400 leading-relaxed text-sm">Track task velocity, monitor completion rates, and stay ahead with real-time workspace performance metrics.</p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors group sm:col-span-2 md:col-span-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Real-time Sync</h3>
            <p className="text-gray-400 leading-relaxed text-sm">Collaborate seamlessly with your team. See task status changes, member activities, and updates instantly.</p>
          </div>

        </div>
      </section>
    </div>
  );
}
