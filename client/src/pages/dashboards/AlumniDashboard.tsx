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
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Menu,
  X,
  Linkedin,
  Globe,
  Phone,
  Building2,
  MapPin,
  ExternalLink,
  Edit3,
  Save,
  RotateCcw,
  TrendingUp,
  Star,
  Calendar,
  Check,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { api, AlumniDashboardData, AlumniMentorshipRequestItem } from '../../lib/api';
import { clearSession, getStoredUser } from '../../lib/auth';

type AlumniTab =
  | 'overview'
  | 'profile'
  | 'requests'
  | 'messages'
  | 'jobs'
  | 'events'
  | 'announcements'
  | 'notifications'
  | 'settings';

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

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Action Required', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
    ACCEPTED: { label: 'Accepted & Scheduled', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    DECLINED: { label: 'Declined', cls: 'bg-slate-100 text-slate-700 border-slate-300' },
    CANCELLED: { label: 'Cancelled', cls: 'bg-red-100 text-red-800 border-red-300' },
    COMPLETED: { label: 'Completed', cls: 'bg-blue-100 text-blue-800 border-blue-300' },
  };
  const v = map[status] || { label: status, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${v.cls}`}>
      {v.label}
    </span>
  );
}

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
);

// Logout Confirmation Modal
const LogoutModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 border border-slate-200">
      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-red-50 border border-red-200 mx-auto mb-4">
        <LogOut className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-base font-bold text-navy-950 text-center">Sign Out of Alumni Portal?</h3>
      <p className="text-xs text-slate-500 text-center mt-2">
        Your active session will be cleared. You can sign back in at any time.
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

// Accept Request Modal
interface RespondModalProps {
  request: { id: string; studentName: string; topic: string } | null;
  action: 'ACCEPT' | 'DECLINE';
  onClose: () => void;
  onSubmit: (requestId: string, payload: any) => Promise<void>;
}

const RespondModal: React.FC<RespondModalProps> = ({ request, action, onClose, onSubmit }) => {
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/alm-connect-call');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [responseNote, setResponseNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmit(request.id, {
        action,
        meetingUrl: action === 'ACCEPT' ? meetingUrl : undefined,
        scheduledAt: action === 'ACCEPT' && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        durationMinutes: action === 'ACCEPT' ? Number(durationMinutes) : undefined,
        responseNote: responseNote.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-navy-950">
            {action === 'ACCEPT' ? 'Accept Mentorship Session' : 'Decline Mentorship Request'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <p className="text-slate-600">
            Student: <strong>{request.studentName}</strong> · Topic: <span className="italic">{request.topic}</span>
          </p>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200">{errorMsg}</div>
          )}

          {action === 'ACCEPT' ? (
            <>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Proposed Meeting Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 px-3 py-1 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Meeting Video Link</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 px-3 py-1 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Session Duration</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full h-9 rounded-lg border border-slate-300 px-3 py-1 text-xs"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes (Standard)</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Note for Student (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Looking forward to our discussion! Please bring your resume draft."
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Reason / Note for Student (Optional)</label>
              <textarea
                rows={3}
                placeholder="e.g. Currently unavailable due to project deadlines. Please feel free to reconnect next month."
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={action === 'ACCEPT' ? 'navy' : 'danger'}
              size="sm"
              isLoading={isSubmitting}
            >
              {action === 'ACCEPT' ? 'Confirm & Propose Slot' : 'Decline Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AlumniDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AlumniTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Modal response state
  const [respondModal, setRespondModal] = useState<{
    request: { id: string; studentName: string; topic: string };
    action: 'ACCEPT' | 'DECLINE';
  } | null>(null);

  // Dashboard Summary State
  const [dashData, setDashData] = useState<AlumniDashboardData | null>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState('');

  // Mentorship Requests Queue
  const [requests, setRequests] = useState<AlumniMentorshipRequestItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState('');

  // Announcements
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    currentCompany: '',
    currentDesignation: '',
    industry: '',
    yearsOfExperience: '',
    city: '',
    country: '',
    bio: '',
    linkedinUrl: '',
    mentorshipTopics: '',
    isWillingToMentor: true,
    maxMentees: 2,
    skills: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auth gate check
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    const user = getStoredUser();
    if (user && user.role === 'ALUMNI' && user.status !== 'VERIFIED') {
      navigate('/account-status', { replace: true });
      return;
    }
  }, [navigate]);

  // Fetch Dashboard Summary
  const fetchDashboard = useCallback(async () => {
    setDashLoading(true);
    setDashError('');
    try {
      const data = await api.getAlumniDashboard();
      if (data.alumni.status !== 'VERIFIED') {
        navigate('/account-status', { replace: true });
        return;
      }
      setDashData(data);

      setEditForm({
        fullName: data.alumni.fullName || '',
        phoneNumber: data.alumni.phoneNumber || '',
        currentCompany: data.alumni.currentCompany || '',
        currentDesignation: data.alumni.currentDesignation || '',
        industry: data.alumni.industry || '',
        yearsOfExperience: data.alumni.yearsOfExperience !== undefined ? String(data.alumni.yearsOfExperience) : '0',
        city: data.alumni.city || '',
        country: data.alumni.country || '',
        bio: data.alumni.bio || '',
        linkedinUrl: data.alumni.linkedinUrl || '',
        mentorshipTopics: data.alumni.mentorshipTopics || '',
        isWillingToMentor: data.alumni.isWillingToMentor,
        maxMentees: data.alumni.maxMentees || 2,
        skills: '',
      });
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('unauthorized') || err.message?.includes('401')) {
        clearSession();
        navigate('/login', { replace: true });
        return;
      }
      if (err.message?.toLowerCase().includes('forbidden') || err.message?.toLowerCase().includes('verified')) {
        navigate('/account-status', { replace: true });
        return;
      }
      setDashError(err.message || 'Failed to load alumni dashboard summary.');
    } finally {
      setDashLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Lazy-load mentorship requests
  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    setRequestsError('');
    try {
      const reqs = await api.getAlumniMentorshipRequests();
      setRequests(reqs);
    } catch (err: any) {
      setRequestsError(err.message || 'Failed to load mentorship requests.');
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [activeTab, fetchRequests]);

  // Lazy-load announcements
  useEffect(() => {
    if (activeTab === 'announcements' && announcements.length === 0) {
      setAnnouncementsLoading(true);
      api.getAlumniAnnouncements()
        .then(setAnnouncements)
        .catch(() => {})
        .finally(() => setAnnouncementsLoading(false));
    }
  }, [activeTab, announcements.length]);

  // Handle responding to mentorship request
  const handleRespondToRequest = async (requestId: string, payload: any) => {
    await api.respondToMentorshipRequest(requestId, payload);
    // Refresh both requests and dashboard metrics
    await Promise.all([fetchRequests(), fetchDashboard()]);
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg(null);
    setIsSaving(true);
    try {
      await api.updateAlumniProfile({
        fullName: editForm.fullName.trim() || undefined,
        phoneNumber: editForm.phoneNumber.trim() || undefined,
        currentCompany: editForm.currentCompany.trim() || undefined,
        currentDesignation: editForm.currentDesignation.trim() || undefined,
        industry: editForm.industry.trim() || undefined,
        yearsOfExperience: editForm.yearsOfExperience ? Number(editForm.yearsOfExperience) : undefined,
        city: editForm.city.trim() || undefined,
        country: editForm.country.trim() || undefined,
        bio: editForm.bio.trim() || undefined,
        linkedinUrl: editForm.linkedinUrl.trim() || undefined,
        mentorshipTopics: editForm.mentorshipTopics.trim() || undefined,
        isWillingToMentor: editForm.isWillingToMentor,
        maxMentees: Number(editForm.maxMentees),
        skills: editForm.skills ? editForm.skills.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      });

      setSaveMsg({ type: 'success', text: 'Professional details updated successfully.' });
      setIsEditing(false);
      await fetchDashboard();
    } catch (err: any) {
      setSaveMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const navItems: { tab: AlumniTab; label: string; icon: React.ElementType; enabled: boolean }[] = [
    { tab: 'overview', label: 'Dashboard', icon: LayoutDashboard, enabled: true },
    { tab: 'profile', label: 'My Profile', icon: User, enabled: true },
    { tab: 'requests', label: 'Mentorship Requests', icon: HandshakeIcon, enabled: true },
    { tab: 'messages', label: 'Messages', icon: MessageSquare, enabled: false },
    { tab: 'jobs', label: 'Jobs & Internships', icon: Briefcase, enabled: true },
    { tab: 'events', label: 'Events', icon: CalendarDays, enabled: true },
    { tab: 'announcements', label: 'Announcements', icon: Megaphone, enabled: true },
    { tab: 'notifications', label: 'Notifications', icon: Bell, enabled: false },
    { tab: 'settings', label: 'Settings', icon: Settings, enabled: false },
  ];

  const alumni = dashData?.alumni;

  // Sidebar Component
  const Sidebar = (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-navy-950 text-white flex flex-col transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
    >
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

      {alumni && (
        <div className="px-4 py-4 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {alumni.fullName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{alumni.fullName}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {alumni.currentDesignation ? `${alumni.currentDesignation}` : `Class of ${alumni.graduationYear}`}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-300 font-semibold">Verified Alumnus</span>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(({ tab, label, icon: Icon, enabled }) => (
          <button
            key={tab}
            onClick={() => {
              if (enabled) {
                setActiveTab(tab);
                setSidebarOpen(false);
              }
            }}
            disabled={!enabled}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors
              ${
                activeTab === tab
                  ? 'bg-brand-600/30 text-brand-300 border border-brand-600/40'
                  : enabled
                  ? 'text-slate-400 hover:bg-navy-800 hover:text-white'
                  : 'text-slate-700 cursor-not-allowed opacity-50'
              }`}
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

  const SidebarOverlay = sidebarOpen ? (
    <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
  ) : null;

  if (dashLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <div className="hidden lg:flex w-64 bg-navy-950 shrink-0" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-white border-b border-slate-200" />
          <main className="flex-1 p-6 space-y-4 max-w-5xl">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
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

  // TAB 1: OVERVIEW
  const OverviewTab = () => {
    const m = dashData!.metrics;
    const a = dashData!.alumni;
    const reqs = dashData!.recentRequests;
    const ann = dashData!.announcements;

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-navy-950 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-card">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 60%)' }}
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-brand-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-indigo-400 shrink-0">
                {a.fullName?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Welcome, {a.fullName}!</h1>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>Verified Alumnus</span>
                  </span>
                </div>
                <p className="text-slate-300 text-xs mt-1">
                  {a.currentDesignation && a.currentCompany
                    ? `${a.currentDesignation} at ${a.currentCompany}`
                    : 'Industry Professional'}{' '}
                  • Class of {a.graduationYear} ({a.degree}) • {a.department}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${a.isWillingToMentor ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                    {a.isWillingToMentor ? `Open for Mentorship (${a.maxMentees} slots)` : 'Mentorship Paused'}
                  </span>
                  {a.city && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[a.city, a.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-400">Profile Completion</p>
                <p className="text-2xl font-bold text-indigo-400">{m.profileCompletionPercentage}%</p>
              </div>
              <div className="h-14 w-14 relative shrink-0">
                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                  <circle className="fill-none stroke-navy-800" strokeWidth="3" cx="18" cy="18" r="15.9" />
                  <circle
                    className="fill-none stroke-indigo-400 transition-all duration-500"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${m.profileCompletionPercentage} 100`}
                    cx="18"
                    cy="18"
                    r="15.9"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Statistics Counters (Genuine DB Information) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab('requests')}
          >
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-slate-500 font-medium">Mentorship Requests</p>
              <p className="text-3xl font-bold mt-1 text-navy-950">{m.mentorshipRequestsReceived}</p>
              <p className="text-[11px] text-amber-600 mt-1 font-semibold">
                {m.pendingRequestsCount} Pending Action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-slate-500 font-medium">Active Mentorships</p>
              <p className="text-3xl font-bold mt-1 text-emerald-600">{m.activeMentorships}</p>
              <p className="text-[11px] text-slate-500 mt-1">Confirmed student pairings</p>
            </CardContent>
          </Card>

          <Card onClick={() => setActiveTab('events')} className="cursor-pointer">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-slate-500 font-medium">Campus Events</p>
              <p className="text-3xl font-bold mt-1 text-indigo-600">{m.upcomingEventsCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">Alumni meets & talks</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-slate-500 font-medium">Students Mentored</p>
              <p className="text-3xl font-bold mt-1 text-brand-600">{m.studentsMentoredCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">Total careers guided</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Inbound Student Requests Queue */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-navy-950">Inbound Student Mentorship Requests</CardTitle>
              <CardDescription>Review student guidance requests from your department</CardDescription>
            </div>
            <button
              onClick={() => setActiveTab('requests')}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              View all requests →
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            {reqs.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-slate-600">No mentorship requests at this time.</p>
                <p className="mt-0.5">When verified students from your department reach out, their requests will appear here.</p>
              </div>
            ) : (
              reqs.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-800 text-sm font-bold shrink-0">
                      {req.studentName?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-navy-950">{req.studentName}</h4>
                        <span className="text-[11px] text-slate-500 font-mono">({req.studentRoll})</span>
                        <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                          {req.studentDept}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1">Topic: {req.topic}</p>
                      <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                        "{req.message}"
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                        <span>Submitted {formatDate(req.createdAt)}</span>
                        {statusBadge(req.status)}
                      </div>
                    </div>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex md:flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="navy"
                        onClick={() =>
                          setRespondModal({
                            request: { id: req.id, studentName: req.studentName, topic: req.topic },
                            action: 'ACCEPT',
                          })
                        }
                        className="text-xs gap-1"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Accept & Propose Slot</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setRespondModal({
                            request: { id: req.id, studentName: req.studentName, topic: req.topic },
                            action: 'DECLINE',
                          })
                        }
                        className="text-xs text-slate-600 hover:text-red-600"
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Campus Circulars */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-navy-950">Campus Announcements & Notices</CardTitle>
              <CardDescription>Official circulars from the Alumni Relations Office</CardDescription>
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
              <div className="text-center py-6 text-slate-400 text-xs">
                <Megaphone className="h-6 w-6 mx-auto mb-1 opacity-30" />
                <p>No active circulars at this moment.</p>
              </div>
            ) : (
              ann.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-brand-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-navy-950 leading-snug">{a.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${categoryColor(a.category)}`}>
                      {a.category.replace(/_/g, ' ')}
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

  // TAB 2: MY PROFILE
  const ProfileTab = () => {
    const a = dashData!.alumni;

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-950">My Alumni Profile</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your professional bio, skills and mentorship preferences</p>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setIsEditing(true); setSaveMsg(null); }}
              className="gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Professional Info</span>
            </Button>
          )}
        </div>

        {saveMsg && (
          <div
            className={`rounded-lg p-3 text-xs flex items-center gap-2 border ${
              saveMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {saveMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{saveMsg.text}</span>
          </div>
        )}

        {/* Locked Institutional Core Credentials */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <CardTitle className="text-sm font-bold text-navy-950">Verified Alma Mater Records</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Academic credentials are verified against university convocation archives and locked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Full Legal Name', value: a.fullName },
                { label: 'Primary Email', value: a.email },
                { label: 'USN / Registration ID', value: a.rollNumber || 'On Record', mono: true },
                { label: 'Department', value: a.department },
                { label: 'Degree Awarded', value: a.degree },
                { label: 'Graduation Batch', value: `Class of ${a.graduationYear}` },
                { label: 'Institution', value: a.collegeName || 'Alumni Connect University' },
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

        {/* Editable Fields Form */}
        {isEditing ? (
          <Card className="border-brand-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-navy-950">Edit Professional Experience</CardTitle>
              <CardDescription className="text-xs">Update your career trajectory and mentee availability</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Display Name"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                  />
                  <Input
                    label="Phone Number"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  />
                  <Input
                    label="Current Employer / Company"
                    placeholder="e.g. Google"
                    value={editForm.currentCompany}
                    onChange={(e) => setEditForm((f) => ({ ...f, currentCompany: e.target.value }))}
                  />
                  <Input
                    label="Designation / Job Title"
                    placeholder="e.g. Staff Software Engineer"
                    value={editForm.currentDesignation}
                    onChange={(e) => setEditForm((f) => ({ ...f, currentDesignation: e.target.value }))}
                  />
                  <Input
                    label="Industry Domain"
                    placeholder="e.g. Software & Cloud Computing"
                    value={editForm.industry}
                    onChange={(e) => setEditForm((f) => ({ ...f, industry: e.target.value }))}
                  />
                  <Input
                    label="Years of Experience"
                    type="number"
                    min={0}
                    max={60}
                    value={editForm.yearsOfExperience}
                    onChange={(e) => setEditForm((f) => ({ ...f, yearsOfExperience: e.target.value }))}
                  />
                  <Input
                    label="City"
                    placeholder="e.g. San Francisco"
                    value={editForm.city}
                    onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                  />
                  <Input
                    label="Country"
                    placeholder="e.g. United States"
                    value={editForm.country}
                    onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="LinkedIn Profile URL"
                      placeholder="https://linkedin.com/in/yourhandle"
                      value={editForm.linkedinUrl}
                      onChange={(e) => setEditForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Professional Bio</label>
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={editForm.bio}
                      onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label="Mentorship Guidance Topics"
                      placeholder="e.g. Distributed Systems, Big Tech Interviewing, Resume Reviews"
                      value={editForm.mentorshipTopics}
                      onChange={(e) => setEditForm((f) => ({ ...f, mentorshipTopics: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label="Skills / Technologies (Comma separated)"
                      placeholder="e.g. Kubernetes, Go, TypeScript, System Design"
                      value={editForm.skills}
                      onChange={(e) => setEditForm((f) => ({ ...f, skills: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs">
                    <p className="font-bold text-navy-950">Accepting Student Mentees</p>
                    <p className="text-slate-500">Allow verified students from your department to request guidance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isWillingToMentor}
                      onChange={(e) => setEditForm((f) => ({ ...f, isWillingToMentor: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setIsEditing(false); setSaveMsg(null); }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="navy" size="sm" isLoading={isSaving} className="gap-1.5">
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-navy-950">Professional Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block">Current Employer</span>
                  <span className="font-semibold text-navy-950">{a.currentCompany || 'Not added'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Designation</span>
                  <span className="font-semibold text-navy-950">{a.currentDesignation || 'Not added'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Industry</span>
                  <span className="font-semibold text-navy-950">{a.industry || 'Not added'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Experience</span>
                  <span className="font-semibold text-navy-950">{a.yearsOfExperience} years</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Location</span>
                  <span className="font-semibold text-navy-950">{[a.city, a.country].filter(Boolean).join(', ') || 'Not added'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Mentorship Status</span>
                  <span className="font-semibold text-emerald-700">
                    {a.isWillingToMentor ? `Open (${a.maxMentees} concurrent slots)` : 'Paused'}
                  </span>
                </div>
                {a.mentorshipTopics && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block">Guidance Topics</span>
                    <span className="font-medium text-slate-800">{a.mentorshipTopics}</span>
                  </div>
                )}
                {a.bio && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block">Bio</span>
                    <p className="font-medium text-slate-700 mt-0.5 leading-relaxed">{a.bio}</p>
                  </div>
                )}
              </div>

              {a.linkedinUrl && (
                <div className="pt-3 border-t border-slate-100">
                  <a
                    href={a.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#0A66C2] font-semibold hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>View Connected LinkedIn Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // TAB 3: MENTORSHIP REQUESTS (Full Queue)
  const RequestsTab = () => {
    if (requestsLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      );
    }

    if (requestsError) {
      return (
        <div className="text-center py-12 text-red-500">
          <AlertCircle className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm">{requestsError}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchRequests}>
            Retry
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-950">Student Mentorship Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {requests.length} total request{requests.length !== 1 ? 's' : ''} on record
            </p>
          </div>
          <Badge variant="blue">{requests.filter((r) => r.status === 'PENDING').length} Action Required</Badge>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            <HandshakeIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold text-slate-700">No mentorship requests in your queue.</p>
            <p className="mt-1">When students request mock interviews or career guidance, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-navy-100 flex items-center justify-center text-navy-800 text-base font-bold shrink-0">
                    {r.studentName?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-navy-950">{r.studentName}</h4>
                      <span className="text-[11px] text-slate-500 font-mono">({r.studentRoll})</span>
                      <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {r.studentDept} ({r.studentDegree} {r.studentSemester ? `Sem ${r.studentSemester}` : ''})
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800">Topic: {r.topic}</p>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic leading-relaxed">
                      "{r.message}"
                    </p>

                    {r.session && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Calendar className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Session Confirmed: {formatDate(r.session.scheduledAt)}</span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          Duration: {r.session.durationMinutes} min • Platform: {r.session.meetingType.replace(/_/g, ' ')}
                        </p>
                        {r.session.meetingUrl && (
                          <a
                            href={r.session.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-brand-700 font-semibold underline mt-1"
                          >
                            <span>Open Video Meeting Room</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {r.alumniResponseNote && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <strong>Your Note:</strong> {r.alumniResponseNote}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400">
                      <span>Submitted: {formatDate(r.createdAt)}</span>
                      {statusBadge(r.status)}
                    </div>
                  </div>
                </div>

                {r.status === 'PENDING' && (
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="navy"
                      onClick={() =>
                        setRespondModal({
                          request: { id: r.id, studentName: r.studentName, topic: r.topic },
                          action: 'ACCEPT',
                        })
                      }
                      className="text-xs gap-1"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Accept & Propose Slot</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setRespondModal({
                          request: { id: r.id, studentName: r.studentName, topic: r.topic },
                          action: 'DECLINE',
                        })
                      }
                      className="text-xs text-slate-600 hover:text-red-600"
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // TAB 4: JOBS & INTERNSHIPS (Authentic State)
  const JobsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-navy-950">Campus Referral & Job Hub</h2>
          <p className="text-xs text-slate-500 mt-0.5">Post hiring referrals and openings directly to verified students</p>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-600" />
            <span>Hiring at {alumni?.currentCompany || 'Your Organization'}?</span>
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            As an institutional alumnus, you can broadcast exclusive campus referrals and internship positions directly
            to qualified students from your alma mater department.
          </p>
        </div>
        <Button variant="navy" size="sm" className="shrink-0" onClick={() => alert('Referral posting module is opening in Phase 4.')}>
          Post New Referral Opportunity
        </Button>
      </div>

      <Card>
        <CardContent className="py-12 text-center text-xs text-slate-400">
          <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-30 text-slate-500" />
          <p className="font-semibold text-slate-700">No active job listings posted yet.</p>
          <p className="mt-0.5">Referral postings you publish will appear here for student applications.</p>
        </CardContent>
      </Card>
    </div>
  );

  // TAB 5: EVENTS
  const EventsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-navy-950">Campus Alumni Events</h2>
        <p className="text-xs text-slate-500 mt-0.5">Annual reunions, department guest lectures, and student networking seminars</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              UPCOMING ANNUAL MEET
            </span>
            <span className="text-xs text-slate-400">December 2026</span>
          </div>
          <h4 className="text-base font-bold text-navy-950">Grand Alumni Homecoming 2026</h4>
          <p className="text-xs text-slate-600">
            Join fellow graduates, department faculty, and the Dean of Student Affairs for the annual institution homecoming.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>Main Campus Auditorium & Innovation Center</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              GUEST LECTURE SERIES
            </span>
            <span className="text-xs text-slate-400">Online / Hybrid</span>
          </div>
          <h4 className="text-base font-bold text-navy-950">Tech Leaders in Cloud & Distributed Systems</h4>
          <p className="text-xs text-slate-600">
            Interactive virtual session connecting final-year engineering students with working industry engineering leaders.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Next session scheduled soon</span>
          </div>
        </div>
      </div>
    </div>
  );

  // TAB 6: ANNOUNCEMENTS
  const AnnouncementsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-navy-950">Alumni Announcements</h2>
        <p className="text-xs text-slate-500 mt-0.5">Official circulars published for the institution's graduate community</p>
      </div>

      <div className="space-y-4">
        {dashData?.announcements.map((a) => (
          <div key={a.id} className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-bold text-navy-950 leading-snug">{a.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${categoryColor(a.category)}`}>
                {a.category.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">{a.content}</p>
            <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
              Published on {formatDate(a.publishedAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  // Coming Soon Tab
  const ComingSoonTab = ({ label }: { label: string }) => (
    <div className="text-center py-24 text-slate-400">
      <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p className="text-base font-bold text-navy-950">{label}</p>
      <p className="text-sm mt-1">This module is prepared for future institutional release.</p>
    </div>
  );

  const tabContent: Record<AlumniTab, React.ReactNode> = {
    overview: dashData ? <OverviewTab /> : null,
    profile: dashData ? <ProfileTab /> : null,
    requests: <RequestsTab />,
    messages: <ComingSoonTab label="Direct Student & Peer Messaging" />,
    jobs: <JobsTab />,
    events: <EventsTab />,
    announcements: <AnnouncementsTab />,
    notifications: <ComingSoonTab label="Institutional Notifications" />,
    settings: <ComingSoonTab label="Account & Security Settings" />,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {SidebarOverlay}
      {Sidebar}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 gap-4">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1">
            <p className="text-sm font-bold text-navy-950 capitalize">
              {navItems.find((n) => n.tab === activeTab)?.label || 'Dashboard'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {alumni && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-navy-950">{alumni.fullName}</span>
                <Badge variant="success" className="text-[10px]">Verified Alumnus</Badge>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {tabContent[activeTab]}
          </div>
        </main>
      </div>

      {showLogoutModal && (
        <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />
      )}

      {respondModal && (
        <RespondModal
          request={respondModal.request}
          action={respondModal.action}
          onClose={() => setRespondModal(null)}
          onSubmit={handleRespondToRequest}
        />
      )}
    </div>
  );
};
