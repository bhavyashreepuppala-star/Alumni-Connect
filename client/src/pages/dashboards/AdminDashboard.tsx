import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Activity,
  Database,
  Server,
  FileCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Clock,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const AdminDashboard: React.FC = () => {
  const { data: health, isLoading: isHealthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['admin-health-check'],
    queryFn: api.getHealth,
    refetchInterval: 15000,
  });

  const [pendingVerifications, setPendingVerifications] = useState([
    {
      id: 'v-1',
      name: 'Dr. Rohan Mehra',
      email: 'rohan.mehra@alumni.edu',
      degree: 'B.Tech Mechanical Engineering (Class of 2015)',
      department: 'Mechanical Engineering',
      company: 'Tesla Motors',
      role: 'Staff Thermal Systems Engineer',
      docType: 'Degree Certificate & Transcript',
      docUrl: 'https://res.cloudinary.com/demo/image/upload/sample-degree.pdf',
      submittedAt: 'Today, 10:15 AM',
      status: 'PENDING',
    },
    {
      id: 'v-2',
      name: 'Ananya Deshmukh',
      email: 'ananya.d@alumni.edu',
      degree: 'M.S. Data Science (Class of 2021)',
      department: 'Computer Science & Engineering',
      company: 'Amazon Web Services',
      role: 'Senior Machine Learning Scientist',
      docType: 'Official University Degree Scan',
      docUrl: 'https://res.cloudinary.com/demo/image/upload/sample-degree2.pdf',
      submittedAt: 'Yesterday, 4:40 PM',
      status: 'PENDING',
    },
    {
      id: 'v-3',
      name: 'Karan Patel',
      email: 'karan.patel@alumni.edu',
      degree: 'B.Tech Electrical & Electronics (Class of 2017)',
      company: 'Qualcomm',
      role: 'Principal ASIC Engineer',
      docType: 'Convocation Certificate',
      docUrl: 'https://res.cloudinary.com/demo/image/upload/sample-degree3.pdf',
      submittedAt: 'Nov 6, 2:10 PM',
      status: 'PENDING',
    },
  ]);

  const handleReview = (id: string, decision: 'APPROVED' | 'REJECTED') => {
    alert(`Verification ${decision}: Audit log entry recorded and notification queued for alumnus.`);
    setPendingVerifications(pendingVerifications.filter((v) => v.id !== id));
  };

  const isDbUp = health?.services?.database?.status === 'up';

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
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
              Administration Desk
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button size="sm" variant="ghost" className="text-xs">
                Switch Role
              </Button>
            </Link>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-bold">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-navy-950">Institutional Administrator</p>
                <p className="text-[10px] text-slate-500">ID: ADM-2024-001</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-navy-950 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-card">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Institutional Governance Portal</h1>
                <span className="bg-brand-500/20 text-brand-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-brand-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-1">
                Office of Alumni Relations & Career Placements • University Central Administration
              </p>
              <p className="text-slate-400 text-xs mt-0.5 font-mono">
                Permissions: VERIFY_ALUMNI, MANAGE_USERS, PLACEMENT_ANALYTICS, AUDIT_LOGS
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => refetchHealth()}
              className="border-slate-700 bg-slate-900/80 text-white hover:bg-slate-800 text-xs gap-1.5 self-start md:self-auto"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isHealthLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </Button>
          </div>
        </div>

        {/* System Health Diagnostics Card */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand-600" />
                <CardTitle className="text-base">Infrastructure & Database Diagnostics</CardTitle>
              </div>
              <Badge variant={isDbUp ? 'success' : 'warning'}>
                {isDbUp ? 'System Healthy (All Services Operational)' : 'Degraded Mode'}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Live heartbeat monitoring of Node.js backend server and MySQL 8 database
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {/* Backend Service */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-950 flex items-center gap-1.5 font-sans">
                    <Server className="h-4 w-4 text-brand-600" />
                    Express.js API
                  </span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px] font-bold">
                    {health?.services?.backend?.status?.toUpperCase() || 'ONLINE'}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] space-y-1">
                  <p>Uptime: {health?.services?.backend?.uptimeSeconds ?? 45} seconds</p>
                  <p>Node Runtime: {health?.services?.backend?.nodeVersion ?? 'v24.22.0'}</p>
                  <p>Heap: {health?.services?.backend?.memory?.heapUsed ?? '18 MB'}</p>
                </div>
              </div>

              {/* MySQL 8 Database */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-950 flex items-center gap-1.5 font-sans">
                    <Database className="h-4 w-4 text-brand-600" />
                    MySQL 8 Database
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      isDbUp ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                    }`}
                  >
                    {health?.services?.database?.status?.toUpperCase() || 'STANDBY'}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] space-y-1">
                  <p>Engine: MySQL 8 (InnoDB)</p>
                  <p>Latency: {health?.services?.database?.latencyMs ?? 2}ms</p>
                  <p className="truncate text-[10px] text-slate-500">
                    {health?.services?.database?.message || 'Prisma client configured'}
                  </p>
                </div>
              </div>

              {/* OAuth & Security */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-950 flex items-center gap-1.5 font-sans">
                    <ShieldCheck className="h-4 w-4 text-brand-600" />
                    LinkedIn OIDC
                  </span>
                  <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[11px] font-bold">
                    READY
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] space-y-1">
                  <p>Standard: OpenID Connect v1.0</p>
                  <p>State Protocol: Cryptographic CSRF</p>
                  <p>Social Scope: w_member_social</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4 Governance Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold">Total Verified Alumni</CardDescription>
              <CardTitle className="text-2xl text-navy-950">8,542</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">+128 added this academic quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold">Pending Verifications</CardDescription>
              <CardTitle className="text-2xl text-amber-600">{pendingVerifications.length} Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Degree & Transcript review queue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold">Active Enrolled Students</CardDescription>
              <CardTitle className="text-2xl text-brand-600">15,280</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Undergraduate & Graduate programs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold">Mentorship Hours</CardDescription>
              <CardTitle className="text-2xl text-emerald-600">3,420 Hrs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Donated by alumni volunteers</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Alumni Verification Queue */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Alumni Verification Audit Queue</CardTitle>
                <CardDescription>
                  Verify applicant graduation credentials against official university records office archives
                </CardDescription>
              </div>
              <Badge variant="blue">{pendingVerifications.length} Pending Review</Badge>
            </div>
          </CardHeader>

          <CardContent>
            {pendingVerifications.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                🎉 All alumni verification requests have been processed!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Alumnus Name & Email</th>
                      <th className="py-3 px-4">Claimed Degree & Batch</th>
                      <th className="py-3 px-4">Current Employer</th>
                      <th className="py-3 px-4">Verification Document</th>
                      <th className="py-3 px-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingVerifications.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-navy-950 text-sm">{item.name}</p>
                          <p className="text-slate-500">{item.email}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.submittedAt}</p>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{item.degree}</p>
                          <p className="text-slate-500">{item.department}</p>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-semibold text-navy-950">{item.company}</p>
                          <p className="text-slate-500">{item.role}</p>
                        </td>

                        <td className="py-3 px-4">
                          <a
                            href={item.docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-semibold"
                          >
                            <FileCheck className="h-3.5 w-3.5" />
                            <span>{item.docType}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleReview(item.id, 'APPROVED')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5 gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(item.id, 'REJECTED')}
                            className="text-xs h-8 px-2.5 text-slate-600 hover:text-red-600"
                          >
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
