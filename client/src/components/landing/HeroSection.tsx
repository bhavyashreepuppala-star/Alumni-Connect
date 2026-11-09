import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, Users, Award, Briefcase, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-20 pb-24 md:pt-28 md:pb-32">
      {/* Subtle background mesh grid */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Institutional Trust Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-950/60 px-4 py-1.5 text-xs font-semibold text-brand-300 backdrop-blur-md shadow-sm">
            <ShieldCheck className="h-4 w-4 text-brand-400" />
            <span>Official University Network • Institutional Verification</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-[1.15]">
            Bridging Campus Aspirations with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-200 to-white">
              Global Alumni Leadership
            </span>
          </h1>

          {/* Value Subtitle */}
          <p className="text-lg text-slate-300 md:text-xl font-normal leading-relaxed max-w-2xl mx-auto">
            A premium, closed-loop network connecting students, alumni, and college administration. Unlock 1-on-1 mentorship, certified career referrals, and measurable institutional impact.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register?role=STUDENT" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-lg shadow-brand-500/25 gap-2">
                <span>Join as Student</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link to="/register?role=ALUMNI" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-900/80 text-white hover:bg-slate-800 hover:text-white font-semibold gap-2">
                <Award className="h-4 w-4 text-brand-400" />
                <span>Join as Alumni</span>
              </Button>
            </Link>

            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="ghost" className="w-full sm:w-auto text-slate-300 hover:text-white hover:bg-white/5">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Highlights Checklist */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Admin-Verified Profiles</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Official LinkedIn OIDC Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Zero Spam • Closed Campus Community</span>
            </div>
          </div>
        </div>

        {/* Global Alumni Employers Banner */}
        <div className="mt-16 pt-10 border-t border-slate-800/80 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
            Alumni Represented Across Leading Global Organizations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all text-sm font-semibold tracking-wide text-slate-300">
            <span className="hover:text-white transition-colors">GOOGLE</span>
            <span className="hover:text-white transition-colors">MICROSOFT</span>
            <span className="hover:text-white transition-colors">AMAZON</span>
            <span className="hover:text-white transition-colors">APPLE</span>
            <span className="hover:text-white transition-colors">META</span>
            <span className="hover:text-white transition-colors">STRIPE</span>
            <span className="hover:text-white transition-colors">MCKINSEY</span>
          </div>
        </div>
      </div>
    </section>
  );
};
