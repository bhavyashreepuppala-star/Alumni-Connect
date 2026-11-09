import React from 'react';
import { GraduationCap, Briefcase, Landmark, Check, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Link } from 'react-router-dom';

export const PillarsSection: React.FC = () => {
  const pillars = [
    {
      role: 'For Current Students',
      title: 'Accelerate Career Discovery',
      badge: 'Undergrad & Postgrad',
      badgeColor: 'bg-blue-100 text-blue-800',
      icon: GraduationCap,
      description:
        'Bridge the gap between textbook coursework and high-impact industry careers through direct access to verified alumni.',
      features: [
        '1-on-1 personalized mentorship matching based on target career and tech stack',
        'Direct campus referrals for internships and full-time engineering/consulting roles',
        'Targeted resume, portfolio, and mock system design / coding reviews',
        'Access to exclusive batch-specific career roadmaps and alumni Q&A sessions',
      ],
      linkText: 'Explore Student Experience',
      linkUrl: '/dashboard/student',
    },
    {
      role: 'For University Alumni',
      title: 'Give Back & Hire Top Talent',
      badge: 'Graduates Worldwide',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      icon: Briefcase,
      description:
        'Stay tightly connected with your alma mater, shape next-generation talent, and hire premier graduates directly for your team.',
      features: [
        'Flexible mentorship control: set mentee capacity or pause whenever busy',
        'Official alumni verification badge with LinkedIn OpenID Connect integration',
        'Post verified referral opportunities directly to qualified departmental students',
        'Host masterclasses, webinars, and stay updated on campus milestones',
      ],
      linkText: 'Explore Alumni Experience',
      linkUrl: '/dashboard/alumni',
    },
    {
      role: 'For Administration',
      title: 'Institutional Impact & Legacy',
      badge: 'Dean & Placement Office',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: Landmark,
      description:
        'Unified centralized governance to verify graduates, monitor career trajectory outcomes, and strengthen alumni relations.',
      features: [
        'Audit-grade verification queue to validate alumni identity against college archives',
        'Real-time career analytics and graduate placement trajectory reports',
        'Institutional announcements, endowment outreach, and alumni reunion management',
        'Role-based access control with granular permission auditing',
      ],
      linkText: 'Explore Admin Desk',
      linkUrl: '/dashboard/admin',
    },
  ];

  return (
    <section id="pillars" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Tripartite Platform Design
          </p>
          <h2 className="text-3xl font-extrabold text-navy-950 sm:text-4xl tracking-tight">
            The Three Pillars of Alumni Connect
          </h2>
          <p className="text-base text-slate-600">
            Engineered specifically to solve the disconnected communication loop between students, graduates, and college administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={idx}
                className="flex flex-col justify-between hover:shadow-card-hover transition-all duration-300 border-slate-200/80 bg-white"
              >
                <div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-lg bg-navy-900 text-white">
                        <Icon className="h-6 w-6 text-brand-400" />
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pillar.badgeColor}`}>
                        {pillar.badge}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                      {pillar.role}
                    </span>
                    <CardTitle className="text-xl mt-1 text-navy-950">{pillar.title}</CardTitle>
                    <CardDescription className="text-slate-600 text-sm mt-2 leading-relaxed">
                      {pillar.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2">
                    <ul className="space-y-3 text-sm text-slate-700">
                      {pillar.features.map((item, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5">
                          <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-700 mt-0.5 shrink-0">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>

                <div className="p-6 pt-2 border-t border-slate-100 mt-6">
                  <Link
                    to={pillar.linkUrl}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    <span>{pillar.linkText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
