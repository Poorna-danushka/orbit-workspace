'use client';

import OrbitIcon from './OrbitIcon';

interface AuthBrandPanelProps {
  title?: string;
  subtitle?: string;
  badge?: string;
}

export default function AuthBrandPanel({
  title = "Manage your team & projects seamlessly in one space.",
  subtitle = "Real-time task tracking, kanban boards, team analytics, and smart notifications — built for modern productive teams.",
  badge = "Orbit Workspace v2.0",
}: AuthBrandPanelProps) {
  return (
    <div className="hidden lg:flex flex-1 relative bg-[#0b0c10] overflow-hidden p-12 flex-col justify-between border-r border-white/[0.08]">
      {/* Background Gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]">
          <OrbitIcon size={24} />
        </div>
        <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          Orbit
        </span>
        <span className="text-xs text-gray-500 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full font-medium ml-2">
          {badge}
        </span>
      </div>

      {/* Middle Hero Content */}
      <div className="relative z-10 max-w-lg space-y-6 my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          Next-Gen Productivity Platform
        </div>
        <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
          {title}
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          {subtitle}
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            <p className="text-white font-semibold text-sm">Kanban & List Views</p>
            <p className="text-gray-500 text-xs mt-0.5">Customizable task boards</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            <p className="text-white font-semibold text-sm">Realtime Chat</p>
            <p className="text-gray-500 text-xs mt-0.5">Project-focused messaging</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            <p className="text-white font-semibold text-sm">Team Analytics</p>
            <p className="text-gray-500 text-xs mt-0.5">Live velocity & output graphs</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            <p className="text-white font-semibold text-sm">Admin Controls</p>
            <p className="text-gray-500 text-xs mt-0.5">Role management & logs</p>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="relative z-10 pt-6 border-t border-white/[0.06] flex items-center justify-between">
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Orbit Workspace. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-gray-400 font-medium">Systems Operational</span>
        </div>
      </div>
    </div>
  );
}
