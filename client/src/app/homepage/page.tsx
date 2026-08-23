import Link from 'next/link';
import { ArrowRight, BarChart3, Check, Layers, Sparkles, Zap } from 'lucide-react';

const features = [
  { icon: Layers, title: 'One clear workspace', text: 'Keep projects, tasks, files, and conversations connected in one focused home.' },
  { icon: BarChart3, title: 'Momentum you can see', text: 'Turn activity into useful signals so your team knows what to do next.' },
  { icon: Zap, title: 'Built for flow', text: 'Move from idea to done without the busywork between every handoff.' },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#08090d] text-white selection:bg-[#8b7cff]/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(85,104,255,0.18),transparent_28%),radial-gradient(circle_at_10%_30%,rgba(139,124,255,0.14),transparent_24%)]" />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/homepage" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#8b7cff] text-[#08090d] shadow-[0_0_24px_rgba(139,124,255,0.35)]"><Layers className="size-5" /></span>
          <span className="text-lg">Orbit</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/login" className="rounded-lg px-3 py-2 text-white/65 transition hover:bg-white/5 hover:text-white">Sign in</Link>
          <Link href="/register" className="rounded-lg bg-white px-4 py-2 font-semibold text-[#08090d] transition hover:bg-white/85">Get started <ArrowRight className="ml-1 inline size-4" /></Link>
        </div>
      </nav>
      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-24 lg:px-12">
        <section className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/65"><Sparkles className="size-3.5 text-[#8b7cff]" /> The calm command center for ambitious teams</div>
            <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-7xl">Make progress <span className="text-[#9b8fff]">visible.</span></h1>
            <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-white/55 sm:text-lg">Orbit gives your team a shared space to plan clearly, move quickly, and finish the work that matters.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="rounded-xl bg-[#8b7cff] px-5 py-3.5 text-center font-semibold text-[#08090d] transition hover:bg-[#a69cff]"><span>Start building free</span><ArrowRight className="ml-2 inline size-4" /></Link><Link href="/login" className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-center font-semibold text-white/80 transition hover:bg-white/[0.08]">Sign in to workspace</Link></div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/45"><span><Check className="mr-1 inline size-3.5 text-[#8b7cff]" />Projects and tasks</span><span><Check className="mr-1 inline size-3.5 text-[#8b7cff]" />Real-time activity</span><span><Check className="mr-1 inline size-3.5 text-[#8b7cff]" />Built for teams</span></div>
          </div>
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.045] p-3 shadow-2xl shadow-[#3d35a0]/20 backdrop-blur-xl"><div className="rounded-2xl border border-white/10 bg-[#11131b] p-5"><div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs text-white/40">Workspace overview</p><h2 className="mt-1 text-xl font-semibold">Good morning, team</h2></div><span className="rounded-lg bg-[#8b7cff]/15 px-2.5 py-1 text-xs text-[#b5afff]">Live</span></div><div className="mt-5 grid grid-cols-3 gap-3">{[['12','Active tasks'],['08','Completed'],['04','Projects']].map(([value,label])=><div key={label} className="rounded-xl border border-white/8 bg-white/[0.035] p-3"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-[11px] text-white/40">{label}</p></div>)}</div><div className="mt-5 rounded-xl border border-white/8 bg-white/[0.025] p-4"><div className="mb-4 flex items-center justify-between"><span className="text-sm font-medium">This week</span><span className="text-xs text-[#9b8fff]">+24% momentum</span></div><div className="flex h-28 items-end gap-2">{[32,48,42,70,56,88,76].map((height,index)=><div key={index} className="flex-1 rounded-t-md bg-[#8b7cff]/70" style={{ height: `${height}%` }} />)}</div></div></div></div>
        </section>
        <section className="mt-24 grid gap-4 md:grid-cols-3">{features.map(({ icon: Icon, title, text })=><article key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:bg-white/[0.06]"><Icon className="size-5 text-[#9b8fff]" /><h3 className="mt-7 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/50">{text}</p></article>)}</section>
      </main>
    </div>
  );
}
