import React from 'react';
import { ShieldCheck, Award, MessageSquare, ExternalLink, Briefcase, MapPin } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export const SpotlightSection: React.FC = () => {
  const alumni = [
    {
      name: 'Sarah Chen',
      batch: 'Class of 2018',
      degree: 'B.Tech Computer Science',
      company: 'Google',
      role: 'Staff Software Engineer',
      location: 'San Francisco, CA',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      bio: 'Architecting distributed systems and cloud backends. Passionate about mentoring students on system design and navigating careers in big tech.',
      topics: ['Distributed Systems', 'System Design', 'FAANG Interviewing', 'Career Mentorship'],
      isVerified: true,
      openForMentees: true,
    },
    {
      name: 'David K. Adeleke',
      batch: 'Class of 2016',
      degree: 'B.Tech Electrical & Electronics',
      company: 'Stripe',
      role: 'Principal Product Manager',
      location: 'New York, NY',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      bio: 'Leading developer platforms and global payments infrastructure. Enthusiastic about guiding engineers transitioning into product strategy.',
      topics: ['Product Strategy', 'Fintech Infrastructure', 'APIs', 'Startup Scaling'],
      isVerified: true,
      openForMentees: true,
    },
    {
      name: 'Priya Sharma',
      batch: 'Class of 2020',
      degree: 'M.S. Artificial Intelligence',
      company: 'Microsoft Research',
      role: 'Senior AI Research Scientist',
      location: 'Seattle, WA',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      bio: 'Researching foundation models, neural code generation and multimodal intelligence. Advises graduate students on academic publishing & R&D.',
      topics: ['LLMs & GenAI', 'Research Publishing', 'Python / PyTorch', 'PhD Applications'],
      isVerified: true,
      openForMentees: true,
    },
  ];

  return (
    <section id="spotlight" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Community Leadership
            </p>
            <h2 className="text-3xl font-extrabold text-navy-950 sm:text-4xl tracking-tight">
              Featured Alumni Mentors
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-xl">
              Meet graduates actively giving back by reviewing portfolios, conducting mock interviews, and providing career direction.
            </p>
          </div>

          <Link to="/register?role=STUDENT">
            <Button variant="outline" size="sm" className="gap-2">
              <span>View All 8,500+ Alumni</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {alumni.map((alum, idx) => (
            <Card
              key={idx}
              className="bg-white border-slate-200/90 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="relative">
                    <img
                      src={alum.avatar}
                      alt={alum.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    {alum.isVerified && (
                      <div
                        title="University & Admin Verified"
                        className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"
                      >
                        <ShieldCheck className="h-5 w-5 text-brand-600 fill-brand-50" />
                      </div>
                    )}
                  </div>
                  {alum.openForMentees && (
                    <Badge variant="success" className="text-[11px] gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>Accepting Mentees</span>
                    </Badge>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-navy-950">{alum.name}</h3>
                  <p className="text-xs font-semibold text-brand-600 mt-0.5 flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{alum.role} at {alum.company}</span>
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>{alum.batch}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {alum.location}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {alum.bio}
                </p>

                <div className="pt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Mentorship Specialties
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {alum.topics.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{alum.degree}</span>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-brand-600 hover:text-brand-700 h-8 px-2 text-xs font-semibold gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Request Session</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
