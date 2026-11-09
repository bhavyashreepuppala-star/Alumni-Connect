import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Calendar,
  Share2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const AlumniDashboard: React.FC = () => {
  const [isAcceptingMentees, setIsAcceptingMentees] = useState(true);
  const [requests, setRequests] = useState([
    {
      id: 'req-1',
      studentName: 'Alex Rivera',
      studentRoll: 'CS2023-4089',
      studentDept: 'Computer Science (Junior)',
      topic: 'System Design & Distributed Backends Mock Interview',
      message: 'Hi Sarah, I am preparing for Summer 2026 SWE internships. Would love 30 minutes of your guidance on large-scale distributed databases and how you tackled Google interviews!',
      date: 'Requested 2 hours ago',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'req-2',
      studentName: 'Maya Patel',
      studentRoll: 'CS2022-1044',
      studentDept: 'Computer Science (Senior)',
      topic: 'Resume Review for Google Cloud Infrastructure SWE',
      message: 'Hello! I recently completed a Kubernetes orchestration project and would appreciate your eyes on my resume before the campus recruitment drive.',
      date: 'Requested yesterday',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
  ]);

  const handleAction = (id: string, action: 'accept' | 'decline') => {
    alert(`Request ${action === 'accept' ? 'accepted! Meeting invitation dispatched to student.' : 'declined.'}`);
    setRequests(requests.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
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
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
              Alumni Mentorship Hub
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button size="sm" variant="ghost" className="text-xs">
                Switch Role
              </Button>
            </Link>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80"
                alt="Sarah Chen"
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-navy-950">Sarah Chen</p>
                <p className="text-[10px] text-slate-500">Google Staff SWE</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Alumni Banner */}
        <div className="bg-navy-950 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-card">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80"
                  alt="Sarah Chen"
                  className="h-16 w-16 rounded-full border-2 border-brand-400 object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-brand-600 fill-brand-50" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">Sarah Chen</h1>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>Verified Alumnus</span>
                  </span>
                </div>
                <p className="text-slate-300 text-xs mt-1">
                  Staff Software Engineer at Google • Class of 2018 (B.Tech CSE) • San Francisco, CA
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    LinkedIn OIDC Verified
                  </span>
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    Degree Cert #2018-CSE-094
                  </span>
                </div>
              </div>
            </div>

            {/* Mentorship Capacity Toggle */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 min-w-[260px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Mentorship Availability</span>
                <span className={`text-[11px] font-bold ${isAcceptingMentees ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isAcceptingMentees ? 'OPEN (2/3 Slots)' : 'PAUSED'}
                </span>
              </div>
              <button
                onClick={() => setIsAcceptingMentees(!isAcceptingMentees)}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  isAcceptingMentees
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isAcceptingMentees ? 'Click to Pause Inbound Requests' : 'Click to Open for Mentees'}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Metric Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold">Students Mentored</CardDescription>
              <CardTitle className="text-2xl text-navy-950">14 Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Across 6 different college departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold">Hiring Referrals</CardDescription>
              <CardTitle className="text-2xl text-brand-600">4 Placed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Google SWE, Cloud Infrastructure & Systems</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold">Inbound Requests</CardDescription>
              <CardTitle className="text-2xl text-amber-600">{requests.length} Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Action required within 48 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold">Alumni Rating</CardDescription>
              <CardTitle className="text-2xl text-emerald-600">5.0 ★★★★★</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">100% positive feedback from mentees</p>
            </CardContent>
          </Card>
        </div>

        {/* Inbound Requests Queue */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Inbound Student Mentorship Requests</CardTitle>
                <CardDescription>
                  Review student requests and propose convenient video meeting slots
                </CardDescription>
              </div>
              <Badge variant="blue">{requests.length} Active Queue</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                🎉 No pending requests right now. Great job keeping your queue clear!
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={req.avatar}
                      alt={req.studentName}
                      className="h-12 w-12 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-navy-950">{req.studentName}</h4>
                        <span className="text-[11px] text-slate-500">({req.studentRoll})</span>
                        <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                          {req.studentDept}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1">Topic: {req.topic}</p>
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 italic leading-relaxed">
                        "{req.message}"
                      </p>
                      <span className="text-[10px] text-slate-400 mt-2 block">{req.date}</span>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="navy"
                      onClick={() => handleAction(req.id, 'accept')}
                      className="text-xs gap-1"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Accept & Schedule</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(req.id, 'decline')}
                      className="text-xs text-slate-600 hover:text-red-600"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Post Referral Banner */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-brand-600" />
              <span>Hiring for your team at Google?</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Broadcast an exclusive campus referral directly to qualified Computer Science students at your alma mater.
            </p>
          </div>
          <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white shrink-0 font-semibold">
            Post Referral Opening
          </Button>
        </div>
      </main>
    </div>
  );
};
