import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  Calendar,
  MessageSquare,
  Award,
  ChevronRight,
  ShieldCheck,
  Search,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const StudentDashboard: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState('All');

  const student = {
    name: 'Alex Rivera',
    rollNumber: 'CS2023-4089',
    department: 'Computer Science & Engineering',
    batch: 'Class of 2026 (6th Semester)',
    cgpa: '3.88 / 4.0',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  };

  const mentors = [
    {
      name: 'Sarah Chen',
      role: 'Staff Software Engineer at Google',
      batch: 'Class of 2018',
      topics: ['Distributed Systems', 'Big Tech Interviewing', 'System Design'],
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      availability: 'Next slot: Tomorrow at 5:00 PM PST',
    },
    {
      name: 'David K. Adeleke',
      role: 'Principal PM at Stripe',
      batch: 'Class of 2016',
      topics: ['Product Strategy', 'Fintech Infrastructure', 'APIs'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      availability: 'Next slot: Friday at 2:00 PM EST',
    },
    {
      name: 'Marcus Vance',
      role: 'DevOps & SRE Lead at Datadog',
      batch: 'Class of 2019',
      topics: ['Kubernetes', 'Cloud Observability', 'Golang'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      availability: 'Next slot: Monday at 11:00 AM PST',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
                <GraduationCap className="h-5 w-5 text-brand-400" />
              </div>
              <span className="font-bold text-navy-950 text-base">ALUMNI CONNECT</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">
              Student Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-600" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <img src={student.avatar} alt={student.name} className="h-8 w-8 rounded-full object-cover" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-navy-950">{student.name}</p>
                <p className="text-[10px] text-slate-500">{student.rollNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Student Profile Overview Banner */}
        <div className="bg-navy-950 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-card">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={student.avatar}
                alt={student.name}
                className="h-16 w-16 rounded-full border-2 border-brand-400 object-cover shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                    Active Student
                  </span>
                </div>
                <p className="text-slate-300 text-xs mt-1">
                  {student.department} • {student.batch} • CGPA: {student.cgpa}
                </p>
                <p className="text-brand-300 text-xs mt-0.5">
                  Roll ID: <code className="bg-navy-900 px-1.5 py-0.5 rounded font-mono">{student.rollNumber}</code>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" className="bg-brand-500 hover:bg-brand-600 font-semibold gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Find an Alumni Mentor</span>
              </Button>
              <Link to="/login">
                <Button size="sm" variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white">
                  Switch Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Quick Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold">Active Sessions</CardDescription>
              <CardTitle className="text-2xl text-brand-600">2 Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Upcoming call tomorrow with Google Staff SWE</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold">Inbound Referrals</CardDescription>
              <CardTitle className="text-2xl text-emerald-600">3 Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Google SWE Internship, Stripe Frontend, Datadog SRE</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold">Department Rank</CardDescription>
              <CardTitle className="text-2xl text-indigo-600">Top 5%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Based on semester CGPA & project repositories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold">Endorsed Skills</CardDescription>
              <CardTitle className="text-2xl text-amber-600">8 Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">TypeScript, React, Node.js, System Design</p>
            </CardContent>
          </Card>
        </div>

        {/* Two-Column Grid: Sessions & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upcoming Sessions & Career Roadmap */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Upcoming Mentorship Sessions</CardTitle>
                    <CardDescription>Scheduled 1-on-1 career direction calls</CardDescription>
                  </div>
                  <Badge variant="blue">1 Scheduled This Week</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80"
                      alt="Sarah Chen"
                      className="h-11 w-11 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-navy-950">Sarah Chen</p>
                        <ShieldCheck className="h-4 w-4 text-brand-600" />
                      </div>
                      <p className="text-xs text-slate-600">Staff Software Engineer at Google</p>
                      <p className="text-xs font-semibold text-brand-700 mt-2 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Tomorrow at 5:00 PM - 5:45 PM (Google Meet)</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Topic: System Design & Mock Interview Strategy</p>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" className="text-xs shrink-0">
                    Join Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Department Skills & Goals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Verified Skill Endorsements</CardTitle>
                <CardDescription>Endorsed by department faculty and alumni mentors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'TypeScript', level: 'Intermediate', count: 5 },
                    { name: 'React', level: 'Advanced', count: 7 },
                    { name: 'Node.js & Express', level: 'Intermediate', count: 4 },
                    { name: 'System Design', level: 'Beginner', count: 2 },
                    { name: 'MySQL / Relational DBs', level: 'Advanced', count: 6 },
                    { name: 'Git & GitHub Workflows', level: 'Advanced', count: 8 },
                  ].map((skill, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 flex items-center gap-2 text-xs shadow-sm"
                    >
                      <span className="font-semibold text-navy-950">{skill.name}</span>
                      <span className="text-[10px] text-slate-400">({skill.level})</span>
                      <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-1.5 rounded">
                        +{skill.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Recommended Mentors in CS */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Matched Alumni Mentors</CardTitle>
                  <span className="text-xs font-semibold text-brand-600">CSE Dept</span>
                </div>
                <CardDescription>Alumni open to taking on student mentees</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {mentors.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-200 hover:bg-slate-50 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="h-10 w-10 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-navy-950">{m.name}</p>
                          <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                        </div>
                        <p className="text-[11px] text-slate-600">{m.role}</p>
                        <p className="text-[10px] text-emerald-600 font-medium mt-1">{m.availability}</p>
                      </div>
                    </div>

                    <Button size="sm" variant="navy" className="h-7 text-xs px-2.5">
                      Request
                    </Button>
                  </div>
                ))}

                <Link to="/#spotlight" className="block text-center pt-2">
                  <span className="text-xs font-semibold text-brand-600 hover:underline">
                    Browse All Mentors Across Departments →
                  </span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
