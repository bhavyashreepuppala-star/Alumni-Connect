import React from 'react';
import { Users, GraduationCap, Building2, Star } from 'lucide-react';

export const StatsSection: React.FC = () => {
  const stats = [
    {
      label: 'Verified Alumni Members',
      value: '8,500+',
      description: 'Across 42 countries worldwide',
      icon: GraduationCap,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: 'Undergraduate & Masters Students',
      value: '15,200+',
      description: 'Actively participating in mentorship',
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Partner Employers & Startups',
      value: '450+',
      description: 'Direct recruitment pipelines',
      icon: Building2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Mentorship Impact Score',
      value: '96%',
      description: 'Positive career placement reviews',
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <section className="relative -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex items-start gap-4"
            >
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-navy-950">{stat.value}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{stat.label}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
