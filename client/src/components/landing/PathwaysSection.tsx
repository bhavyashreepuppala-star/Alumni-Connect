import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Briefcase, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const PathwaysSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'ALUMNI' | 'ADMIN'>('STUDENT');

  const pathways = {
    STUDENT: {
      title: 'Current Student Pathway',
      subtitle: 'Unlock access to senior mentorship and corporate openings',
      badge: 'Immediate University Roll Verification',
      steps: [
        {
          num: '01',
          title: 'Sign Up with Roll Number',
          desc: 'Register using your university email or college student registration ID.',
        },
        {
          num: '02',
          title: 'Curate Your Tech & Career Interests',
          desc: 'Tag your target skills (e.g. Distributed Systems, Product Management, Machine Learning).',
        },
        {
          num: '03',
          title: 'Book 1-on-1 Mentorship',
          desc: 'Request sessions directly with verified alumni working at top global companies.',
        },
      ],
      ctaText: 'Register as Student',
      ctaUrl: '/register?role=STUDENT',
      demoDashboard: '/dashboard/student',
    },
    ALUMNI: {
      title: 'Distinguished Alumni Pathway',
      subtitle: 'Give back, hire talent, and reconnect with fellow graduates',
      badge: 'Admin & LinkedIn OpenID Verified',
      steps: [
        {
          num: '01',
          title: '1-Click LinkedIn OIDC Connection',
          desc: 'Connect your professional LinkedIn profile to sync current company and role securely.',
        },
        {
          num: '02',
          title: 'Degree & Graduation Validation',
          desc: 'Submit your graduation batch and degree certificate for one-time institutional admin verification.',
        },
        {
          num: '03',
          title: 'Set Mentorship Availability',
          desc: 'Specify your capacity (e.g. 2 hours/month) and review inbound student requests effortlessly.',
        },
      ],
      ctaText: 'Register as Alumni',
      ctaUrl: '/register?role=ALUMNI',
      demoDashboard: '/dashboard/alumni',
    },
    ADMIN: {
      title: 'Institutional Administration Pathway',
      subtitle: 'Govern the collegiate ecosystem with audit-ready transparency',
      badge: 'Faculty & Administrative Governance',
      steps: [
        {
          num: '01',
          title: 'Administrative Security Review',
          desc: 'Access the restricted portal with employee credentials and multi-factor approval.',
        },
        {
          num: '02',
          title: 'Process Alumni Verification Queue',
          desc: 'Review submitted degree documents and LinkedIn assertions with 1-click approvals.',
        },
        {
          num: '03',
          title: 'Track Placement & Engagement Health',
          desc: 'Generate real-time analytics reports on graduate outcomes, donations, and alumni initiatives.',
        },
      ],
      ctaText: 'Register Institutional Admin',
      ctaUrl: '/register?role=ADMIN',
      demoDashboard: '/dashboard/admin',
    },
  };

  const current = pathways[activeTab];

  return (
    <section id="pathways" className="py-24 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Tailored Experiences
          </p>
          <h2 className="text-3xl font-extrabold text-navy-950 sm:text-4xl tracking-tight">
            How Alumni Connect Works For You
          </h2>
          <p className="text-slate-600 text-sm">
            Select your role to explore the customized onboarding workflow and ecosystem privileges.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-xl bg-slate-100 p-1.5 border border-slate-200">
            <button
              onClick={() => setActiveTab('STUDENT')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'STUDENT'
                  ? 'bg-white text-navy-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="h-4 w-4 text-brand-600" />
              <span>I am a Student</span>
            </button>

            <button
              onClick={() => setActiveTab('ALUMNI')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'ALUMNI'
                  ? 'bg-white text-navy-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="h-4 w-4 text-brand-600" />
              <span>I am an Alumnus</span>
            </button>

            <button
              onClick={() => setActiveTab('ADMIN')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'ADMIN'
                  ? 'bg-white text-navy-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="h-4 w-4 text-brand-600" />
              <span>College Administration</span>
            </button>
          </div>
        </div>

        {/* Selected Role Content */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-slate-200 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{current.badge}</span>
              </div>
              <h3 className="text-2xl font-bold text-navy-950">{current.title}</h3>
              <p className="text-slate-600 text-sm mt-1">{current.subtitle}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link to={current.demoDashboard}>
                <Button variant="outline" size="sm">
                  View Demo Dashboard
                </Button>
              </Link>
              <Link to={current.ctaUrl}>
                <Button variant="navy" size="sm" className="gap-1.5">
                  <span>{current.ctaText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {current.steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden"
              >
                <span className="text-4xl font-extrabold text-slate-100 absolute top-3 right-4 select-none">
                  {step.num}
                </span>
                <span className="text-xs font-bold text-brand-600 tracking-wider uppercase block mb-1">
                  Step {step.num}
                </span>
                <h4 className="text-base font-semibold text-navy-950 mb-2">{step.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
