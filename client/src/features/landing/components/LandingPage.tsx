'use client';

import LandingNav from './LandingNav';
import LandingHero from './LandingHero';
import LandingFeatureSections from './LandingFeatureSections';
import LandingWorkflowSections from './LandingWorkflowSections';
import LandingIntegrations from './LandingIntegrations';
import LandingCallToAction from './LandingCallToAction';
import LandingSiteFooter from './LandingSiteFooter';

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--ob-bg)',
        color: 'var(--ob-text)',
        overflowX: 'hidden',
      }}
    >
      <LandingNav />

      <LandingHero />

      <LandingFeatureSections />
      <LandingWorkflowSections />
      <LandingIntegrations />
      <LandingCallToAction />
      <LandingSiteFooter />
    </div>
  );
}
