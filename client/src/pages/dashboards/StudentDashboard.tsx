import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  User,
  Users,
  HandshakeIcon,
  Briefcase,
  CalendarDays,
  Megaphone,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Menu,
  X,
  Github,
  Linkedin,
  Globe,
  Phone,
  BookOpen,
  Edit3,
  Save,
  RotateCcw,
  TrendingUp,
  Star,
  Building2,
  MapPin,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { api, StudentDashboardData, AlumniDirectoryItem, MentorshipItem } from '../../lib/api';
import { clearSession, getStoredUser } from '../../lib/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

type SidebarTab =
  | 'overview'
  | 'profile'
  | 'alumni'
  | 'mentorship'
  | 'jobs'
  | 'events'
  | 'announcements'
  | 'messages'
  | 'notifications'
  | 'settings';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function categoryColor(category: string): string {
  const map: Record<string, string> = {
    URGENT: 'bg-red-100 text-red-800 border-red-200',
    PLACEMENT_UPDATE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ALUMNI_MEET_NOTICE: 'bg-brand-100 text-brand-800 border-brand-200',
    ACADEMIC_CALENDAR: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    GENERAL_CIRCULAR: 'bg-slate-100 text-slate-700 border-slate-200',
    DEPARTMENTAL: 'bg-amber-100 text-amber-800 border-amber-200',
  };
  return map[category] || 'bg-slate-100 text-slate-700 border-slate-200';
}

function mentorshipStatusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Awaiting Response', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    ACCEPTED: { label: 'Accepted', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    DECLINED: { label: 'Declined', cls: 'bg-red-100 text-red-800 border-red-200' },
    CANCELLED: { label: 'Cancelled', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
    COMPLETED: { label: 'Completed', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  };
  const v = map[status] || { label: status, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${v.cls}`}>
      {v.label}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
);

// ─── Logout Confirmation Modal ────────────────────────────────────────────────

const LogoutModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 border border-slate-200">
      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-red-50 border border-red-200 mx-auto mb-4">
        <LogOut className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-base font-bold text-navy-950 text-center">Sign Out of Alumni Connect?</h3>
      <p className="text-xs text-slate-500 text-center mt-2">
        Your session will be cleared. You can sign back in at any time.
      </p>
      <div className="flex gap-3 mt-6">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" className="flex-1" onClick={onConfirm}>
          Sign Out
        </Button>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SidebarTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Dashboard data
  const [dashData, setDashData] = useState<StudentDashboardData | null>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState('');

  // Alumni directory
  const [alumni, setAlumni] = useState<AlumniDirectoryItem[]>([]);
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [alumniError, setAlumniError] = useState('');

  // Mentorship
  const [mentorships, setMentorships] = useState<MentorshipItem[]>([]);
  const [mentorshipsLoading, setMentorshipsLoading] = useState(false);
  const [mentorshipsError, setMentorshipsError] = useState('');

  // Announcements
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState('');

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    headline: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    cgpa: '',
    currentSemester: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Auth gate: check token and verified status ──────────────────────────────
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    const user = getStoredUser();
    if (user && user.role === 'STUDENT' && user.status !== 'VERIFIED') {
      navigate('/account-status', { replace: true });
      return;
    }
  }, [navigate]);

  // ── Fetch dashboard data on mount ───────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setDashLoading(true);
    setDashError('');
    try {
      const data = await api.getStudentDashboard();
      // Double-check verification status from live DB response
      if (data.student.status !== 'VERIFIED') {
        navigate('/account-status', { replace: true });
        return;
      }
      setDashData(data);
      // Seed edit form with current DB values
      setEditForm({
        fullName: data.student.fullName || '',
        phoneNumber: data.student.phoneNumber || '',
        headline: data.student.headline || '',
        bio: data.student.bio || '',
        githubUrl: data.student.githubUrl || '',
        linkedinUrl: data.student.linkedinUrl || '',
        portfolioUrl: data.student.portfolioUrl || '',
        cgpa: data.student.cgpa !== null && data.student.cgpa !== undefined ? String(data.student.cgpa) : '',
        currentSemester: data.student.currentSemester !== null && data.student.currentSemester !== undefined
          ? String(data.student.currentSemester)
          : '',
      });
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.toLowerCase().includes('unauthorized') ||
          err.message?.toLowerCase().includes('authentication')) {
        clearSession();
        navigate('/login', { replace: true });
        return;
      }
      if (err.message?.toLowerCase().includes('forbidden') || err.message?.toLowerCase().includes('verified')) {
        navigate('/account-status', { replace: true });
        return;
      }
      setDashError(err.message || 'Failed to load dashboard. Please try again.');
    } finally {
      setDashLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ── Lazy-load alumni when tab is activated ──────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'alumni' || alumni.length > 0) return;
    setAlumniLoading(true);
    setAlumniError('');
    api.getAlumniDirectory()
      .then(setAlumni)
      .catch((err: any) => setAlumniError(err.message || 'Failed to load alumni directory'))
      .finally(() => setAlumniLoading(false));
  }, [activeTab, alumni.length]);

  // ── Lazy-load mentorships ───────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'mentorship' || mentorships.length > 0) return;
    setMentorshipsLoading(true);
    setMentorshipsError('');
    api.getMentorshipRequests()
      .then(setMentorships)
      .catch((err: any) => setMentorshipsError(err.message || 'Failed to load mentorship requests'))
      .finally(() => setMentorshipsLoading(false));
  }, [activeTab, mentorships.length]);

  // ── Lazy-load announcements ─────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'announcements' || announcements.length > 0) return;
    setAnnouncementsLoading(true);
    setAnnouncementsError('');
    api.getAnnouncements()
      .then(setAnnouncements)
      .catch((err: any) => setAnnouncementsError(err.message || 'Failed to load announcements'))
      .finally(() => setAnnouncementsLoading(false));
  }, [activeTab, announcements.length]);

  // ── Profile update handler ──────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg(null);
    setIsSaving(true);
    try {
      const payload: Record<string, any> = {};
      if (editForm.fullName.trim()) payload.fullName = editForm.fullName.trim();
      if (editForm.phoneNumber.trim() !== undefined) payload.phoneNumber = editForm.phoneNumber.trim() || undefined;
      if (editForm.headline !== undefined) payload.headline = editForm.headline.trim() || undefined;
      if (editForm.bio !== undefined) payload.bio = editForm.bio.trim() || undefined;
      if (editForm.githubUrl !== undefined) payload.githubUrl = editForm.githubUrl.trim() || undefined;
      if (editForm.linkedinUrl !== undefined) payload.linkedinUrl = editForm.linkedinUrl.trim() || undefined;
      if (editForm.portfolioUrl !== undefined) payload.portfolioUrl = editForm.portfolioUrl.trim() || undefined;
      if (editForm.cgpa.trim()) payload.cgpa = parseFloat(editForm.cgpa);
      if (editForm.currentSemester.trim()) payload.currentSemester = parseInt(editForm.currentSemester, 10);

      await api.updateStudentProfile(payload);
      setSaveMsg({ type: 'success', text: 'Profile saved to institutional database.' });
      setIsEditing(false);
      // Re-fetch dashboard to reflect saved changes
      await fetchDashboard();
    } catch (err: any) {
      setSaveMsg({ type: 'error', text: err.message || 'Failed to save profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  // ── Sidebar nav items ───────────────────────────────────────────────────────
  const navItems: { tab: SidebarTab; label: string; icon: React.ElementType; enabled: boolean }[] = [
    { tab: 'overview', label: 'Overview', icon: LayoutDashboard, enabled: true },
    { tab: 'profile', label: 'My Profile', icon: User, enabled: true },
    { tab: 'alumni', label: 'Discover Alumni', icon: Users, enabled: true },
    { tab: 'mentorship', label: 'Mentorship', icon: HandshakeIcon, enabled: true },
    { tab: 'jobs', label: 'Jobs & Internships', icon: Briefcase, enabled: false },
    { tab: 'events', label: 'Events', icon: CalendarDays, enabled: false },
    { tab: 'announcements', label: 'Announcements', icon: Megaphone, enabled: true },
    { tab: 'messages', label: 'Messages', icon: MessageSquare, enabled: false },
    { tab: 'notifications', label: 'Notifications', icon: Bell, enabled: false },
    { tab: 'settings', label: 'Settings', icon: Settings, enabled: false },
  ];

  const student = dashData?.student;

  // ─── Sidebar ───────────────────────────────────────────────────────────────
  const Sidebar = (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-navy-950 text-white flex flex-col transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
    >
      {/* Sidebar Brand */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-navy-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800">
            <GraduationCap className="h-5 w-5 text-brand-400" />
          </div>
          <span className="font-bold text-white text-sm">ALUMNI CONNECT</span>
        </Link>
        <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Student Mini Card */}
      {student && (
        <div className="px-4 py-4 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {student.fullName?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{student.fullName}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{student.rollNumber}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-300 font-semibold">Institutionally Verified</span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(({ tab, label, icon: Icon, enabled }) => (
          <button
            key={tab}
            onClick={() => { if (enabled) { setActiveTab(tab); setSidebarOpen(false); } }}
            disabled={!enabled}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors
              ${activeTab === tab
                ? 'bg-brand-600/30 text-brand-300 border border-brand-600/40'
                : enabled
                  ? 'text-slate-400 hover:bg-navy-800 hover:text-white'
                  : 'text-slate-700 cursor-not-allowed opacity-50'
              }`}
            title={!enabled ? 'Coming soon in a future phase' : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
            {!enabled && (
              <span className="ml-auto text-[9px] font-semibold text-slate-600 bg-navy-900 border border-navy-700 px-1.5 py-0.5 rounded">
                SOON
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-navy-800">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  // ─── Overlay for mobile sidebar ────────────────────────────────────────────
  const SidebarOverlay = sidebarOpen ? (
    <div
      className="fixed inset-0 z-20 bg-black/50 lg:hidden"
      onClick={() => setSidebarOpen(false)}
    />
  ) : null;

  // ─── Loading skeleton for dashboard ───────────────────────────────────────
  if (dashLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <div className="hidden lg:flex w-64 bg-navy-950 shrink-0" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-white border-b border-slate-200" />
          <main className="flex-1 p-6 space-y-4 max-w-5xl">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
            </div>
            <Skeleton className="h-48 w-full" />
          </main>
        </div>
      </div>
    );
  }

  if (dashError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center shadow-lg border-slate-200">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-navy-950 mb-2">Dashboard Unavailable</h2>
          <p className="text-xs text-slate-600 mb-5">{dashError}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={fetchDashboard}>
              Retry
            </Button>
            <Button variant="navy" size="sm" onClick={() => { clearSession(); navigate('/login'); }}>
              Return to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ─── Tab content ───────────────────────────────────────────────────────────

  // OVERVIEW
  const OverviewTab = () => {
    const m = dashData!.metrics;
    const s = dashData!.student;
    const ann = dashData!.announcements;

    return (
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="bg-navy-950 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 60%)' }} />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-bold border-2 border-brand-400 shrink-0">
                {s.fullName?.[0]?.toUpperCase() || 'S'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">Welcome back, {s.fullName?.split(' ')[0]}!</h1>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                    ✓ Verified Student
                  </span>
                </div>
                <p className="text-slate-300 text-xs mt-1">
                  {s.department} · {s.degree} · {s.currentSemester ? `Semester ${s.currentSemester}` : `Class of ${s.expectedGraduationYear}`}
                </p>
                {s.cgpa && (
                  <p className="text-brand-300 text-xs mt-0.5">CGPA: <strong>{s.cgpa}</strong></p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs text-slate-400">Profile Completion</p>
                <p className="text-2xl font-bold text-brand-400">{m.profileCompletionPercentage}%</p>
              </div>
              <div className="h-14 w-14 relative shrink-0">
                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                  <circle className="fill-none stroke-navy-800" strokeWidth="3" cx="18" cy="18" r="15.9" />
                  <circle
                    className="fill-none stroke-brand-400 transition-all duration-500"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${m.profileCompletionPercentage} 100`}
                    cx="18" cy="18" r="15.9"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Mentorship Requests', value: m.mentorshipRequestsCount, color: 'text-brand-600', action: 'mentorship' as SidebarTab },
            { label: 'Saved Jobs', value: m.savedJobsCount, color: 'text-emerald-600', action: null },
            { label: 'Registered Events', value: m.upcomingEventsCount, color: 'text-indigo-600', action: null },
            { label: 'Skills on Profile', value: m.skillsCount, color: 'text-amber-600', action: null },
          ].map((card) => (
            <Card
              key={card.label}
              className={`hover:shadow-md transition-shadow ${card.action ? 'cursor-pointer' : ''}`}
              onClick={() => card.action && setActiveTab(card.action)}
            >
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile completion hint */}
        {m.profileCompletionPercentage < 100 && (
          <div className="rounded-xl border border-brand-200 bg-brand-50/70 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-brand-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-brand-900">Your profile is {m.profileCompletionPercentage}% complete</p>
                <p className="text-xs text-brand-700">Add a headline, bio, and social links to improve discoverability with alumni mentors.</p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => setActiveTab('profile')} className="shrink-0">
              Complete Profile
            </Button>
          </div>
        )}

        {/* Announcements feed */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Campus Announcements</CardTitle>
              <CardDescription>Official notices from the College Administration</CardDescription>
            </div>
            <button
              onClick={() => setActiveTab('announcements')}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              View all →
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ann.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No announcements at this time.</p>
              </div>
            ) : (
              ann.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-navy-950 leading-snug">{a.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${categoryColor(a.category)}`}>
                      {a.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{a.content}</p>
                  <p className="text-[10px] text-slate-400 mt-2">{formatDate(a.publishedAt)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // MY PROFILE
  const ProfileTab = () => {
    const s = dashData!.student;

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-950">My Academic Profile</h2>
            <p className="text-xs text-slate-500 mt-0.5">View and update your permitted profile information</p>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); setSaveMsg(null); }} className="gap-1.5">
              <Edit3 className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          )}
        </div>

        {saveMsg && (
          <div className={`rounded-lg p-3 text-xs flex items-center gap-2 border ${
            saveMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {saveMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{saveMsg.text}</span>
          </div>
        )}

        {/* Locked institutional fields */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <CardTitle className="text-sm font-bold text-navy-950">Institutional Credentials</CardTitle>
            </div>
            <CardDescription className="text-xs">These fields are locked and can only be changed by college administration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Full Name (Registered)', value: s.fullName },
                { label: 'Institutional Email', value: s.email },
                { label: 'USN / Roll Number', value: s.rollNumber, mono: true },
                { label: 'Department', value: s.department },
                { label: 'Degree / Program', value: s.degree },
                { label: 'Graduation Year', value: String(s.expectedGraduationYear) },
              ].map(({ label, value, mono }) => (
                <div key={label} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{label}</span>
                  <span className={`text-sm font-semibold text-navy-950 mt-0.5 block ${mono ? 'font-mono' : ''}`}>
                    {value || '—'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editable fields */}
        {isEditing ? (
          <Card className="border-brand-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-navy-950">Edit Profile Details</CardTitle>
              <CardDescription className="text-xs">These fields can be updated at any time</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Display Name"
                    placeholder="Your full name"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="+91 98765 43210"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  />
                  <Input
                    label="Current Semester"
                    type="number"
                    min={1} max={12}
                    placeholder="e.g. 5"
                    value={editForm.currentSemester}
                    onChange={(e) => setEditForm(f => ({ ...f, currentSemester: e.target.value }))}
                  />
                  <Input
                    label="CGPA"
                    type="number"
                    min={0} max={10} step={0.01}
                    placeholder="e.g. 8.75"
                    value={editForm.cgpa}
                    onChange={(e) => setEditForm(f => ({ ...f, cgpa: e.target.value }))}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Professional Headline"
                      placeholder="e.g. Full-stack developer interested in distributed systems"
                      value={editForm.headline}
                      onChange={(e) => setEditForm(f => ({ ...f, headline: e.target.value }))}
                    />
                  </div>
                  <Input
                    label="GitHub URL"
                    placeholder="https://github.com/yourhandle"
                    value={editForm.githubUrl}
                    onChange={(e) => setEditForm(f => ({ ...f, githubUrl: e.target.value }))}
                  />
                  <Input
                    label="LinkedIn URL"
                    placeholder="https://linkedin.com/in/yourhandle"
                    value={editForm.linkedinUrl}
                    onChange={(e) => setEditForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Portfolio / Personal Website"
                      placeholder="https://yoursite.dev"
                      value={editForm.portfolioUrl}
                      onChange={(e) => setEditForm(f => ({ ...f, portfolioUrl: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Bio</label>
                    <textarea
                      rows={4}
                      maxLength={2000}
                      placeholder="Briefly describe your background, projects, and goals..."
                      value={editForm.bio}
                      onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-y"
                    />
                    <p className="text-[10px] text-slate-400 text-right">{editForm.bio.length}/2000</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setIsEditing(false); setSaveMsg(null); }}
                    disabled={isSaving}
                    className="gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="navy"
                    size="sm"
                    isLoading={isSaving}
                    className="gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save to Database
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-navy-950">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <span className="font-medium text-slate-800">{s.phoneNumber || <span className="italic text-slate-400">Not provided</span>}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">CGPA</span>
                  <span className="font-medium text-slate-800">{s.cgpa !== null && s.cgpa !== undefined ? `${s.cgpa} / 10` : <span className="italic text-slate-400">Not added</span>}</span>
                </div>
                {s.currentSemester && (
                  <div>
                    <span className="text-slate-400 block">Current Semester</span>
                    <span className="font-medium text-slate-800">Semester {s.currentSemester}</span>
                  </div>
                )}
                {s.headline && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block">Headline</span>
                    <span className="font-medium text-slate-800">{s.headline}</span>
                  </div>
                )}
                {s.bio && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block">Bio</span>
                    <p className="font-medium text-slate-800 leading-relaxed mt-0.5">{s.bio}</p>
                  </div>
                )}
              </div>
              {(s.githubUrl || s.linkedinUrl || s.portfolioUrl) && (
                <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-200">
                  {s.githubUrl && (
                    <a href={s.githubUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
                      <Github className="h-3.5 w-3.5" /> GitHub
                    </a>
                  )}
                  {s.linkedinUrl && (
                    <a href={s.linkedinUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#0A66C2] hover:text-[#004182] border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50">
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  )}
                  {s.portfolioUrl && (
                    <a href={s.portfolioUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-brand-700 hover:text-brand-900 border border-brand-200 rounded-lg px-3 py-1.5 hover:bg-brand-50">
                      <Globe className="h-3.5 w-3.5" /> Portfolio
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ALUMNI DIRECTORY
  const AlumniTab = () => {
    if (alumniLoading) {
      return (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      );
    }
    if (alumniError) {
      return (
        <div className="text-center py-16 text-slate-500">
          <AlertCircle className="h-10 w-10 mx-auto mb-2 text-red-400" />
          <p className="text-sm font-medium text-red-600">{alumniError}</p>
          <Button variant="outline" size="sm" className="mt-4"
            onClick={() => { setAlumni([]); setAlumniError(''); setActiveTab('alumni'); }}>
            Retry
          </Button>
        </div>
      );
    }
    if (alumni.length === 0) {
      return (
        <div className="text-center py-16 text-slate-400">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No verified alumni in the directory yet.</p>
          <p className="text-xs mt-1">Alumni profiles become discoverable after institutional verification.</p>
        </div>
      );
    }
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-navy-950">Alumni Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">{alumni.length} verified alumni available for mentorship</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alumni.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-brand-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-500 to-navy-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {a.fullName?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-navy-950 truncate">{a.fullName}</p>
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                  </div>
                  {a.currentDesignation && a.currentCompany && (
                    <p className="text-xs text-slate-600 truncate">{a.currentDesignation} at {a.currentCompany}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {a.department} · Class of {a.graduationYear}
                    {a.yearsOfExperience > 0 && ` · ${a.yearsOfExperience}y exp`}
                  </p>
                  {(a.city || a.country) && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {[a.city, a.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              {a.isWillingToMentor && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                    Open to mentorship
                  </span>
                  {a.linkedinUrl && (
                    <a href={a.linkedinUrl} target="_blank" rel="noreferrer"
                      className="text-[11px] text-brand-600 hover:underline flex items-center gap-0.5">
                      LinkedIn <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // MENTORSHIP
  const MentorshipTab = () => {
    if (mentorshipsLoading) {
      return <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>;
    }
    if (mentorshipsError) {
      return (
        <div className="text-center py-16 text-red-500">
          <AlertCircle className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm">{mentorshipsError}</p>
        </div>
      );
    }
    if (mentorships.length === 0) {
      return (
        <div className="text-center py-16 text-slate-400">
          <HandshakeIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No mentorship requests yet.</p>
          <p className="text-xs mt-1">Browse the alumni directory and send a mentorship request to get started.</p>
          <Button variant="navy" size="sm" className="mt-4" onClick={() => setActiveTab('alumni')}>
            Browse Alumni
          </Button>
        </div>
      );
    }
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-navy-950">Mentorship Requests</h2>
          <p className="text-xs text-slate-500 mt-0.5">{mentorships.length} request{mentorships.length !== 1 ? 's' : ''} on record</p>
        </div>
        <div className="space-y-3">
          {mentorships.map((m) => (
            <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 text-sm font-bold shrink-0">
                    {m.alumni.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy-950">{m.alumni.name}</p>
                    {m.alumni.company && (
                      <p className="text-xs text-slate-500">{m.alumni.designation} at {m.alumni.company}</p>
                    )}
                  </div>
                </div>
                {mentorshipStatusBadge(m.status)}
              </div>
              <div className="mt-3 pl-13 space-y-1.5 pl-[52px]">
                <p className="text-xs font-semibold text-slate-700">Topic: <span className="font-normal">{m.topic}</span></p>
                <p className="text-xs text-slate-500 line-clamp-2">{m.reason}</p>
                {m.session && (
                  <div className="mt-2 p-2.5 rounded-lg bg-brand-50 border border-brand-200 text-xs text-brand-800">
                    <span className="font-semibold">Scheduled: </span>
                    {formatDate(m.session.scheduledAt)} · {m.session.durationMinutes} min · {m.session.meetingType.replace('_', ' ')}
                    {m.session.meetingUrl && (
                      <a href={m.session.meetingUrl} target="_blank" rel="noreferrer"
                        className="ml-2 font-semibold underline flex items-center gap-0.5 inline-flex">
                        Join <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
                {m.alumniResponseNote && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <span className="font-semibold">Alumni note: </span>{m.alumniResponseNote}
                  </div>
                )}
                <p className="text-[10px] text-slate-400">Submitted {formatDate(m.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ANNOUNCEMENTS (full)
  const AnnouncementsTab = () => {
    if (announcementsLoading) {
      return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>;
    }
    if (announcementsError) {
      return (
        <div className="text-center py-16 text-red-500">
          <AlertCircle className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm">{announcementsError}</p>
        </div>
      );
    }
    if (announcements.length === 0) {
      return (
        <div className="text-center py-16 text-slate-400">
          <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No announcements at this time.</p>
          <p className="text-xs mt-1">Official campus notices will appear here when published.</p>
        </div>
      );
    }
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-navy-950">Campus Announcements</h2>
          <p className="text-xs text-slate-500 mt-0.5">{announcements.length} announcement{announcements.length !== 1 ? 's' : ''} published</p>
        </div>
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-bold text-navy-950 leading-snug">{a.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${categoryColor(a.category)}`}>
                  {a.category.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{a.content}</p>
              <p className="text-[10px] text-slate-400 mt-3">{formatDate(a.publishedAt)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Coming-soon placeholder
  const ComingSoonTab = ({ label }: { label: string }) => (
    <div className="text-center py-24 text-slate-400">
      <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p className="text-base font-bold text-navy-950">{label}</p>
      <p className="text-sm mt-1">This module is coming in a future phase of Alumni Connect.</p>
    </div>
  );

  const tabContent: Record<SidebarTab, React.ReactNode> = {
    overview: dashData ? <OverviewTab /> : null,
    profile: dashData ? <ProfileTab /> : null,
    alumni: <AlumniTab />,
    mentorship: <MentorshipTab />,
    jobs: <ComingSoonTab label="Jobs & Internships" />,
    events: <ComingSoonTab label="Events & Workshops" />,
    announcements: <AnnouncementsTab />,
    messages: <ComingSoonTab label="Direct Messaging" />,
    notifications: <ComingSoonTab label="Notifications" />,
    settings: <ComingSoonTab label="Account Settings" />,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {SidebarOverlay}

      {/* Sidebar */}
      {Sidebar}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-10 h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 gap-4">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1">
            <p className="text-sm font-bold text-navy-950 capitalize">
              {navItems.find(n => n.tab === activeTab)?.label || 'Dashboard'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {student && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-navy-950">{student.fullName}</span>
                <Badge variant="success" className="text-[10px]">Verified</Badge>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {tabContent[activeTab]}
          </div>
        </main>
      </div>

      {/* Logout modal */}
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
};
