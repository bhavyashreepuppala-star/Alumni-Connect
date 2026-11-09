import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { HeroSection } from '../components/landing/HeroSection';
import { StatsSection } from '../components/landing/StatsSection';
import { PillarsSection } from '../components/landing/PillarsSection';
import { PathwaysSection } from '../components/landing/PathwaysSection';
import { SpotlightSection } from '../components/landing/SpotlightSection';
import { LinkedInSection } from '../components/landing/LinkedInSection';
import { CTASection } from '../components/landing/CTASection';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <PillarsSection />
        <PathwaysSection />
        <SpotlightSection />
        <LinkedInSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};
