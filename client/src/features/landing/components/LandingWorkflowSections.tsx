'use client';

import { WorkflowCard } from './LandingCards';

export default function LandingWorkflowSections() {
  return (
    <>
      {/* WORKFLOWS */}
      <section id="solutions" className="ob-section" style={{ background: 'var(--ob-surface)' }}>
        <div className="ob-container">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 60px' }}>
            <p
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--ob-cyan)',
                marginBottom: 12,
              }}
            >
              SOLUTIONS
            </p>
            <h2
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                marginBottom: 16,
              }}
            >
              Workflows for every project, <span className="ob-gradient-text-2">big or small</span>
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: 16,
            }}
          >
            <WorkflowCard
              emoji="🚀"
              title="Project Management"
              desc="Plan sprints, track milestones, and deliver on time with beautiful boards and timelines."
              accent="#7c6eff"
            />
            <WorkflowCard
              emoji="📅"
              title="Meetings & Planning"
              desc="Align your team before, during, and after meetings with shared agendas and action items."
              accent="#06d6f7"
            />
            <WorkflowCard
              emoji="🎯"
              title="Onboarding"
              desc="Get new team members up to speed faster with structured task flows and role-based access."
              accent="#a855f7"
            />
            <WorkflowCard
              emoji="⚡"
              title="Task Manager"
              desc="Capture, prioritise, and complete tasks with custom filters, tags, and deadline reminders."
              accent="#22d3a0"
            />
          </div>
        </div>
      </section>

      {/* VIEW MODES */}
      <section className="ob-section">
        <div className="ob-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 80,
              alignItems: 'center',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--ob-violet)',
                  marginBottom: 16,
                }}
              >
                MULTIPLE VIEWS
              </p>
              <h2
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  marginBottom: 16,
                }}
              >
                See work in a whole <span className="ob-gradient-text-2">new way</span>
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  color: 'var(--ob-text-muted)',
                  lineHeight: 1.7,
                  marginBottom: 28,
                }}
              >
                Switch between Board, List, Timeline, Calendar, and Dashboard views. Every
                perspective you need to stay on top of every project.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: '📋', label: 'Kanban Board', desc: 'Visualise workflow stages' },
                  { icon: '📅', label: 'Calendar', desc: 'Deadline-focused view' },
                  { icon: '📊', label: 'Dashboard', desc: 'High-level progress overview' },
                  { icon: '📌', label: 'Timeline', desc: 'Gantt-style project roadmap' },
                ].map((v) => (
                  <div key={v.label} className="ob-view-row">
                    <span style={{ fontSize: 20 }}>{v.icon}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ob-text)' }}>
                        {v.label}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--ob-text-muted)' }}>{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div
                className="ob-glass-strong"
                style={{ borderRadius: 20, padding: 20, boxShadow: 'var(--ob-shadow-glow)' }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--ob-text-muted)',
                    marginBottom: 16,
                  }}
                >
                  Sprint Board — Week 3
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    {
                      col: 'To Do',
                      color: '#7c6eff',
                      tasks: ['API integration', 'Dark mode', 'Tests'],
                    },
                    {
                      col: 'In Progress',
                      color: '#f59e0b',
                      tasks: ['Homepage redesign', 'Auth flow'],
                    },
                    {
                      col: 'Done',
                      color: '#22d3a0',
                      tasks: ['DB schema', 'CI/CD pipeline', 'Figma kit'],
                    },
                  ].map((col) => (
                    <div key={col.col}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: col.color,
                          }}
                        />
                        <span
                          style={{ fontSize: 10, fontWeight: 600, color: 'var(--ob-text-muted)' }}
                        >
                          {col.col}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            background: `${col.color}22`,
                            color: col.color,
                            padding: '1px 5px',
                            borderRadius: 4,
                            marginLeft: 'auto',
                          }}
                        >
                          {col.tasks.length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {col.tasks.map((t) => (
                          <div
                            key={t}
                            style={{
                              background: 'var(--ob-surface-3)',
                              border: '1px solid var(--ob-border)',
                              borderRadius: 8,
                              padding: '8px 10px',
                              fontSize: 10,
                              color: 'var(--ob-text)',
                            }}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
