'use client';

import { BarChart3, LayoutDashboard, Users, Zap } from 'lucide-react';
import { FeatureCard } from './LandingCards';
import LandingSectionHeading from './LandingSectionHeading';

export default function LandingFeatureSections() {
  return (
    <>
      {/* SOCIAL PROOF */}
      <section
        style={{
          padding: '24px 0',
          borderTop: '1px solid var(--ob-border)',
          borderBottom: '1px solid var(--ob-border)',
          background: 'var(--ob-surface)',
        }}
      >
        <div className="ob-container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 40,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.82rem', color: 'var(--ob-text-muted)' }}>
              Trusted by teams at
            </span>
            {['Notion', 'Linear', 'Vercel', 'Stripe', 'Figma', 'GitHub'].map((c) => (
              <span
                key={c}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--ob-text-faint)',
                  letterSpacing: '-0.01em',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="ob-section">
        <div className="ob-container">
          <LandingSectionHeading
            eyebrow="WHY ORBIT"
            accent="var(--ob-primary)"
            title={
              <>
                A productivity <span className="ob-gradient-text-2">powerhouse</span>
              </>
            }
            description="Define tasks, set goals, collaborate in real-time, and track everything from one unified workspace."
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
            }}
          >
            <FeatureCard
              icon={LayoutDashboard}
              title="One clear workspace"
              desc="Keep projects, tasks, files, and conversations connected in one focused home with real-time updates."
              color="#7c6eff"
            />
            <FeatureCard
              icon={BarChart3}
              title="Momentum you can see"
              desc="Turn team activity into useful signals so everyone knows what to tackle next without a meeting."
              color="#06d6f7"
            />
            <FeatureCard
              icon={Zap}
              title="Built for flow"
              desc="Move from idea to shipped without the busywork between every handoff. Automate the repetitive parts."
              color="#a855f7"
            />
            <FeatureCard
              icon={Users}
              title="Team at a glance"
              desc="See who's working on what, who's blocked, and what's nearly done — instantly, at every scale."
              color="#22d3a0"
            />
          </div>
        </div>
      </section>
    </>
  );
}
