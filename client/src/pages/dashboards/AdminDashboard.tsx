import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Megaphone,
  History,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  LogOut,
  Building,
  Briefcase,
  Award,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Lock,
  Unlock,
  Check,
  X,
  FileCheck,
  Send,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  api,
  AdminDashboardSummaryData,
  AdminStudentItem,
  AdminAlumniItem,
  AdminAnnouncementItem,
  AdminAppealItem,
  AdminAuditLogItem,
} from '../../lib/api';
import { clearSession, getStoredUser } from '../../lib/auth';

type AdminTab =
  | 'overview'
  | 'queue'
  | 'students'
  | 'alumni'
  | 'appeals'
  | 'announcements'
  | 'audit_logs';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storedUser = getStoredUser();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Search & Filter States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('ALL');
  const [studentDeptFilter, setStudentDeptFilter] = useState('ALL');

  const [alumniSearch, setAlumniSearch] = useState('');
  const [alumniStatusFilter, setAlumniStatusFilter] = useState('ALL');
  const [alumniCompanyFilter, setAlumniCompanyFilter] = useState('');

  const [appealStatusFilter, setAppealStatusFilter] = useState('ALL');

  const [auditLogSearch, setAuditLogSearch] = useState('');
  const [auditLogActionFilter, setAuditLogActionFilter] = useState('ALL');

  // Modal States
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentItem | null>(null);
  const [selectedAlumni, setSelectedAlumni] = useState<AdminAlumniItem | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AdminAuditLogItem | null>(null);

  // Review Modal State (for Student or Alumni verification)
  const [reviewModalState, setReviewModalState] = useState<{
    isOpen: boolean;
    type: 'STUDENT' | 'ALUMNI';
    id: string;
    userName: string;
    userEmail: string;
    decision: 'APPROVE' | 'REJECT';
    reason: string;
  } | null>(null);

  // Moderation Modal State (Suspend / Reinstate)
  const [moderationModalState, setModerationModalState] = useState<{
    isOpen: boolean;
    action: 'SUSPEND' | 'REINSTATE';
    userId: string;
    userEmail: string;
    userName: string;
    reason: string;
  } | null>(null);

  // Appeal Resolution Modal State
  const [appealModalState, setAppealModalState] = useState<{
    isOpen: boolean;
    appealId: string;
    userName: string;
    actionAppealed: string;
    decision: 'APPROVE' | 'REJECT';
    resolutionVerdict: string;
  } | null>(null);

  // Announcement Modal State (Create / Edit)
  const [announcementModalState, setAnnouncementModalState] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    id?: string;
    title: string;
    category: string;
    content: string;
    targetAudience: string;
    targetDepartment: string;
    priority: string;
    status: string;
  } | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const showNotification = (msg: string, isErr = false) => {
    if (isErr) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 6000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // -------------------------------------------------------------
  // QUERIES
  // -------------------------------------------------------------
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['admin-summary'],
    queryFn: api.getAdminDashboardSummary,
    refetchInterval: 30000,
  });

  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ['admin-students', studentSearch, studentStatusFilter, studentDeptFilter],
    queryFn: () =>
      api.getAdminStudents({
        search: studentSearch,
        status: studentStatusFilter,
        department: studentDeptFilter !== 'ALL' ? studentDeptFilter : undefined,
        limit: 30,
      }),
    enabled: activeTab === 'students' || activeTab === 'queue',
  });

  const {
    data: alumniData,
    isLoading: isAlumniLoading,
    refetch: refetchAlumni,
  } = useQuery({
    queryKey: ['admin-alumni', alumniSearch, alumniStatusFilter, alumniCompanyFilter],
    queryFn: () =>
      api.getAdminAlumni({
        search: alumniSearch,
        status: alumniStatusFilter,
        company: alumniCompanyFilter || undefined,
        limit: 30,
      }),
    enabled: activeTab === 'alumni' || activeTab === 'queue',
  });

  const {
    data: appealsData,
    isLoading: isAppealsLoading,
    refetch: refetchAppeals,
  } = useQuery({
    queryKey: ['admin-appeals', appealStatusFilter],
    queryFn: () =>
      api.getAdminAppeals({
        status: appealStatusFilter !== 'ALL' ? appealStatusFilter : undefined,
      }),
    enabled: activeTab === 'appeals',
  });

  const {
    data: announcementsData,
    isLoading: isAnnouncementsLoading,
    refetch: refetchAnnouncements,
  } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: api.getAdminAnnouncements,
    enabled: activeTab === 'announcements',
  });

  const {
    data: auditLogsData,
    isLoading: isAuditLogsLoading,
    refetch: refetchAuditLogs,
  } = useQuery({
    queryKey: ['admin-audit-logs', auditLogSearch, auditLogActionFilter],
    queryFn: () =>
      api.getAdminAuditLogs({
        search: auditLogSearch,
        action: auditLogActionFilter !== 'ALL' ? auditLogActionFilter : undefined,
        limit: 40,
      }),
    enabled: activeTab === 'audit_logs' || activeTab === 'overview',
  });

  // -------------------------------------------------------------
  // MUTATIONS
  // -------------------------------------------------------------
  const reviewStudentMutation = useMutation({
    mutationFn: ({ id, decision, reason }: { id: string; decision: 'APPROVE' | 'REJECT'; reason?: string }) =>
      api.reviewAdminStudentVerification(id, { decision, reason }),
    onSuccess: (data) => {
      showNotification(`Student verification review recorded.`);
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
      setReviewModalState(null);
      setSelectedStudent(null);
    },
    onError: (err: any) => {
      showNotification(err.message || 'Failed to review student verification', true);
    },
  });

  const reviewAlumniMutation = useMutation({
    mutationFn: ({ id, decision, reason }: { id: string; decision: 'APPROVE' | 'REJECT'; reason?: string }) =>
      api.reviewAdminAlumniVerification(id, { decision, reason }),
    onSuccess: () => {
      showNotification(`Alumni verification review recorded.`);
      queryClient.invalidateQueries({ queryKey: ['admin-alumni'] });
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
      setReviewModalState(null);
      setSelectedAlumni(null);
    },
    onError: (err: any) => {
      showNotification(err.message || 'Failed to review alumni verification', true);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      api.suspendUser(userId, reason),
    onSuccess: () => {
      showNotification('Account suspended successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alumni'] });
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
      setModerationModalState(null);
      setSelectedStudent(null);
      setSelectedAlumni(null);
    },
    onError: (err: any) => {
      showNotification(err.message || 'Failed to suspend account', true);
    },
  });

  const reinstateMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      api.reinstateUser(userId, reason),
    onSuccess: () => {
      showNotification('Account reinstated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alumni'] });
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
      setModerationModalState(null);
      setSelectedStudent(null);
      setSelectedAlumni(null);
    },
    onError: (err: any) => {
      showNotification(err.message || 'Failed to reinstate account', true);
    },
  });

  const resolveAppealMutation = useMutation({
    mutationFn: ({
      appealId,
      decision,
      resolutionVerdict,
    }: {
      appealId: string;
      decision: 'APPROVE' | 'REJECT';
      resolutionVerdict: string;
    }) => api.resolveAdminAppeal(appealId, { decision, resolutionVerdict }),
    onSuccess: () => {
      showNotification('Appeal resolution applied.');
      queryClient.invalidateQueries({ queryKey: ['admin-appeals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alumni'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
      setAppealModalState(null);
    },
    onError: (err: any) => {
      showNotification(err.message || 'Failed to resolve appeal', true);
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: (payload: any) => api.createAdminAnnouncement(payload),
    onSuccess: () => {
      showNotification('Announcement created successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
      setAnnouncementModalState(null);
    },
    onError: (err: any) => {
      showNotification(err.message || 'Failed to create announcement', true);
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      api.updateAdminAnnouncement(id, payload),
    onSuccess: () => {
      showNotification('Announcement updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
      setAnnouncementModalState(null);
    },
    onError: (err: any) => {
      showNotification(err.message || 'Failed to update announcement', true);
    },
  });

  const toggleAnnouncementStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' }) =>
      api.toggleAdminAnnouncementStatus(id, status),
    onSuccess: () => {
      showNotification('Announcement status changed.');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
    },
    onError: (err: any) => {
      showNotification(err.message || 'Failed to toggle announcement status', true);
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id: string) => api.deleteAdminAnnouncement(id),
    onSuccess: () => {
      showNotification('Announcement deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
    },
    onError: (err: any) => {
      showNotification(err.message || 'Failed to delete announcement', true);
    },
  });

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const pendingStudentsList =
    studentsData?.students?.filter((s) => s.status === 'PENDING_VERIFICATION') || [];
  const pendingAlumniList =
    alumniData?.alumni?.filter((a) => a.status === 'PENDING_VERIFICATION') || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white shadow-sm">
                <GraduationCap className="h-5 w-5 text-brand-400" />
              </div>
              <span className="font-bold text-navy-950 text-base tracking-tight">ALUMNI CONNECT</span>
            </Link>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
              <span>CDC Administrative Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 gap-1.5"
              onClick={() => {
                refetchSummary();
                refetchStudents();
                refetchAlumni();
                refetchAppeals();
                refetchAnnouncements();
                refetchAuditLogs();
                showNotification('Data refreshed from MySQL');
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900">
                {summaryData?.admin?.name || storedUser?.fullName || 'Institutional Admin'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {summaryData?.admin?.employeeId || 'Office of Career Services'}
              </span>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {actionSuccess && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 text-center font-medium shadow transition-all flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="bg-rose-600 text-white text-xs px-4 py-2.5 text-center font-medium shadow transition-all flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-3 space-y-1 sticky top-20">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4" />
                <span>Overview Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'queue'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="h-4 w-4" />
                <span>Verification Queue</span>
              </div>
              {(summaryData?.metrics?.totalPendingVerifications || 0) > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {summaryData?.metrics?.totalPendingVerifications}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'students'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4" />
                <span>Student Management</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {summaryData?.metrics?.totalStudents || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('alumni')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'alumni'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Award className="h-4 w-4" />
                <span>Alumni Management</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {summaryData?.metrics?.totalAlumni || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('appeals')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'appeals'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4" />
                <span>Appeals & Reviews</span>
              </div>
              {(summaryData?.metrics?.pendingAppeals || 0) > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {summaryData?.metrics?.pendingAppeals}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'announcements'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Megaphone className="h-4 w-4" />
                <span>Announcements</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {summaryData?.metrics?.totalAnnouncements || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('audit_logs')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'audit_logs'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History className="h-4 w-4" />
                <span>Audit Logs</span>
              </div>
            </button>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* ============================================================= */}
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {/* ============================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 p-6 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      CDC Institutional Console
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Welcome, {summaryData?.admin?.name || 'Administrator'}
                  </h1>
                  <p className="mt-1 text-xs text-slate-300">
                    Institutional oversight of student registrations, graduate verification, account
                    governance, and campus announcements.
                  </p>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Students</span>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">
                    {summaryData?.metrics?.totalStudents ?? '...'}
                  </div>
                  <span className="text-[11px] text-slate-500">Registered undergraduate / grad</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Alumni</span>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <Award className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">
                    {summaryData?.metrics?.totalAlumni ?? '...'}
                  </div>
                  <span className="text-[11px] text-slate-500">Graduates in workforce</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-900">Pending Review</span>
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-amber-950">
                    {summaryData?.metrics?.totalPendingVerifications ?? '...'}
                  </div>
                  <span className="text-[11px] text-amber-800">
                    {summaryData?.metrics?.pendingStudents || 0} students,{' '}
                    {summaryData?.metrics?.pendingAlumni || 0} alumni
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-900">Verified Users</span>
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <UserCheck className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-emerald-950">
                    {summaryData?.metrics?.verifiedUsers ?? '...'}
                  </div>
                  <span className="text-[11px] text-emerald-800">Full platform networking active</span>
                </div>
              </div>

              {/* Status Breakdown Bar */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Verified Accounts</div>
                    <div className="text-lg font-bold text-slate-900">
                      {summaryData?.metrics?.verifiedUsers || 0}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                    <UserX className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Rejected Accounts</div>
                    <div className="text-lg font-bold text-slate-900">
                      {summaryData?.metrics?.rejectedUsers || 0}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Suspended Accounts</div>
                    <div className="text-lg font-bold text-slate-900">
                      {summaryData?.metrics?.suspendedUsers || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Column Grid: Pending Queue Preview & Recent Audit Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Verification Triage */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base text-navy-950">Verification Action Queue</CardTitle>
                        <CardDescription className="text-xs">
                          Pending accounts awaiting institutional approval
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-brand-600 font-semibold"
                        onClick={() => setActiveTab('queue')}
                      >
                        View All <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {summaryData?.metrics?.totalPendingVerifications === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        Verification queue is empty. All current submissions are reviewed!
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <GraduationCap className="h-4 w-4 text-amber-700" />
                            <div>
                              <div className="text-xs font-bold text-amber-950">
                                {summaryData?.metrics?.pendingStudents || 0} Students Pending
                              </div>
                              <div className="text-[11px] text-amber-800">
                                University USN & enrollment validation required
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="text-xs h-7 bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => {
                              setStudentStatusFilter('PENDING_VERIFICATION');
                              setActiveTab('students');
                            }}
                          >
                            Review
                          </Button>
                        </div>

                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Award className="h-4 w-4 text-purple-700" />
                            <div>
                              <div className="text-xs font-bold text-purple-950">
                                {summaryData?.metrics?.pendingAlumni || 0} Alumni Pending
                              </div>
                              <div className="text-[11px] text-purple-800">
                                Degree & employment credentials require review
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="text-xs h-7 bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => {
                              setAlumniStatusFilter('PENDING_VERIFICATION');
                              setActiveTab('alumni');
                            }}
                          >
                            Review
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Audit Feed */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base text-navy-950">Recent Admin Activities</CardTitle>
                        <CardDescription className="text-xs">
                          Immutable institutional audit trail
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-brand-600 font-semibold"
                        onClick={() => setActiveTab('audit_logs')}
                      >
                        All Logs <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-3">
                    {summaryData?.recentAuditLogs?.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">No admin logs yet.</div>
                    ) : (
                      <div className="space-y-2.5">
                        {summaryData?.recentAuditLogs?.slice(0, 5).map((log) => (
                          <div
                            key={log.id}
                            className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    log.action.includes('APPROVE')
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : log.action.includes('REJECT')
                                      ? 'bg-rose-100 text-rose-800'
                                      : log.action.includes('SUSPEND')
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {log.action}
                                </span>
                                <span className="font-semibold text-slate-800">{log.performedBy}</span>
                              </div>
                              <p className="text-slate-600 text-[11px] line-clamp-1">{log.reason}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                              {new Date(log.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 2: VERIFICATION QUEUE (PENDING USERS ONLY) */}
          {/* ============================================================= */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy-950">Verification Review Queue</h2>
                <p className="text-xs text-slate-500">
                  Review submitted university credentials, confirm USN records, and grant or reject platform access.
                </p>
              </div>

              {/* Pending Students Section */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      <span>Pending Student Submissions ({pendingStudentsList.length})</span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {pendingStudentsList.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No students currently pending review.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Student Name & Email</th>
                            <th className="p-3">USN / Roll No</th>
                            <th className="p-3">Department & Program</th>
                            <th className="p-3">Submitted</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pendingStudentsList.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50/60">
                              <td className="p-3">
                                <div className="font-semibold text-slate-900">{s.fullName}</div>
                                <div className="text-slate-500 text-[11px]">{s.email}</div>
                              </td>
                              <td className="p-3 font-mono font-semibold text-blue-800">
                                {s.studentProfile?.rollNumber || '—'}
                              </td>
                              <td className="p-3">
                                <div>{s.studentProfile?.department}</div>
                                <div className="text-[11px] text-slate-500">
                                  {s.studentProfile?.degree} • Sem {s.studentProfile?.currentSemester}
                                </div>
                              </td>
                              <td className="p-3 text-slate-500 text-[11px]">
                                {new Date(s.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-3 text-right space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7"
                                  onClick={() => setSelectedStudent(s)}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                                </Button>
                                <Button
                                  size="sm"
                                  className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() =>
                                    setReviewModalState({
                                      isOpen: true,
                                      type: 'STUDENT',
                                      id: s.id,
                                      userName: s.fullName,
                                      userEmail: s.email,
                                      decision: 'APPROVE',
                                      reason: '',
                                    })
                                  }
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 text-rose-600 border-rose-200 hover:bg-rose-50"
                                  onClick={() =>
                                    setReviewModalState({
                                      isOpen: true,
                                      type: 'STUDENT',
                                      id: s.id,
                                      userName: s.fullName,
                                      userEmail: s.email,
                                      decision: 'REJECT',
                                      reason: '',
                                    })
                                  }
                                >
                                  <X className="h-3.5 w-3.5 mr-1" /> Reject
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

              {/* Pending Alumni Section */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      <span>Pending Alumni Submissions ({pendingAlumniList.length})</span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {pendingAlumniList.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No alumni currently pending review.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Alumnus Name & Email</th>
                            <th className="p-3">Company & Role</th>
                            <th className="p-3">Degree & Batch</th>
                            <th className="p-3">USN / Roll No</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pendingAlumniList.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50/60">
                              <td className="p-3">
                                <div className="font-semibold text-slate-900">{a.fullName}</div>
                                <div className="text-slate-500 text-[11px]">{a.email}</div>
                              </td>
                              <td className="p-3">
                                <div className="font-semibold text-purple-900">
                                  {a.alumniProfile?.currentCompany || 'Not specified'}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {a.alumniProfile?.currentDesignation || '—'}
                                </div>
                              </td>
                              <td className="p-3">
                                <div>{a.alumniProfile?.department}</div>
                                <div className="text-[11px] text-slate-500">
                                  Class of {a.alumniProfile?.graduationYear}
                                </div>
                              </td>
                              <td className="p-3 font-mono text-[11px] text-slate-600">
                                {a.alumniProfile?.rollNumber || '—'}
                              </td>
                              <td className="p-3 text-right space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7"
                                  onClick={() => setSelectedAlumni(a)}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                                </Button>
                                <Button
                                  size="sm"
                                  className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() =>
                                    setReviewModalState({
                                      isOpen: true,
                                      type: 'ALUMNI',
                                      id: a.id,
                                      userName: a.fullName,
                                      userEmail: a.email,
                                      decision: 'APPROVE',
                                      reason: '',
                                    })
                                  }
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 text-rose-600 border-rose-200 hover:bg-rose-50"
                                  onClick={() =>
                                    setReviewModalState({
                                      isOpen: true,
                                      type: 'ALUMNI',
                                      id: a.id,
                                      userName: a.fullName,
                                      userEmail: a.email,
                                      decision: 'REJECT',
                                      reason: '',
                                    })
                                  }
                                >
                                  <X className="h-3.5 w-3.5 mr-1" /> Reject
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
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 3: STUDENT MANAGEMENT */}
          {/* ============================================================= */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-navy-950">Student Management</h2>
                  <p className="text-xs text-slate-500">
                    Search and govern undergraduate and graduate student records
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, USN..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>

                <div>
                  <select
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value)}
                    className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="ALL">All Verification Statuses</option>
                    <option value="PENDING_VERIFICATION">Pending Verification</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div>
                  <select
                    value={studentDeptFilter}
                    onChange={(e) => setStudentDeptFilter(e.target.value)}
                    className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Computer Science and Engineering">Computer Science</option>
                    <option value="Information Science and Engineering">Information Science</option>
                    <option value="Electronics and Communication Engineering">ECE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                  </select>
                </div>
              </div>

              {/* Students Table */}
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  {isStudentsLoading ? (
                    <div className="p-8 text-center text-xs text-slate-400">Loading student records...</div>
                  ) : studentsData?.students?.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">No matching students found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Student</th>
                            <th className="p-3">USN / Roll No</th>
                            <th className="p-3">Academic Program</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {studentsData?.students?.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50/60">
                              <td className="p-3">
                                <div className="font-semibold text-slate-900">{s.fullName}</div>
                                <div className="text-slate-500 text-[11px]">{s.email}</div>
                              </td>
                              <td className="p-3 font-mono font-semibold text-blue-900">
                                {s.studentProfile?.rollNumber || '—'}
                              </td>
                              <td className="p-3">
                                <div>{s.studentProfile?.department}</div>
                                <div className="text-[11px] text-slate-500">
                                  {s.studentProfile?.degree} • Class of{' '}
                                  {s.studentProfile?.expectedGraduationYear}
                                </div>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    s.status === 'VERIFIED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : s.status === 'PENDING_VERIFICATION'
                                      ? 'bg-amber-100 text-amber-800'
                                      : s.status === 'REJECTED'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-slate-200 text-slate-800'
                                  }`}
                                >
                                  {s.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-3 text-right space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7"
                                  onClick={() => setSelectedStudent(s)}
                                >
                                  Details
                                </Button>
                                {s.status === 'PENDING_VERIFICATION' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                                      onClick={() =>
                                        setReviewModalState({
                                          isOpen: true,
                                          type: 'STUDENT',
                                          id: s.id,
                                          userName: s.fullName,
                                          userEmail: s.email,
                                          decision: 'APPROVE',
                                          reason: '',
                                        })
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-7 text-rose-600 border-rose-200"
                                      onClick={() =>
                                        setReviewModalState({
                                          isOpen: true,
                                          type: 'STUDENT',
                                          id: s.id,
                                          userName: s.fullName,
                                          userEmail: s.email,
                                          decision: 'REJECT',
                                          reason: '',
                                        })
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {s.status === 'VERIFIED' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 text-amber-700 border-amber-300 hover:bg-amber-50"
                                    onClick={() =>
                                      setModerationModalState({
                                        isOpen: true,
                                        action: 'SUSPEND',
                                        userId: s.id,
                                        userName: s.fullName,
                                        userEmail: s.email,
                                        reason: '',
                                      })
                                    }
                                  >
                                    Suspend
                                  </Button>
                                )}
                                {(s.status === 'SUSPENDED' || s.status === 'REJECTED') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                    onClick={() =>
                                      setModerationModalState({
                                        isOpen: true,
                                        action: 'REINSTATE',
                                        userId: s.id,
                                        userName: s.fullName,
                                        userEmail: s.email,
                                        reason: '',
                                      })
                                    }
                                  >
                                    Reinstate
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 4: ALUMNI MANAGEMENT */}
          {/* ============================================================= */}
          {activeTab === 'alumni' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-navy-950">Alumni Management</h2>
                  <p className="text-xs text-slate-500">
                    Verify graduate credentials, company appointments, and mentor governance
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, company, USN..."
                    value={alumniSearch}
                    onChange={(e) => setAlumniSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>

                <div>
                  <select
                    value={alumniStatusFilter}
                    onChange={(e) => setAlumniStatusFilter(e.target.value)}
                    className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="ALL">All Verification Statuses</option>
                    <option value="PENDING_VERIFICATION">Pending Verification</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Filter by company (e.g. Google)..."
                    value={alumniCompanyFilter}
                    onChange={(e) => setAlumniCompanyFilter(e.target.value)}
                    className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>
              </div>

              {/* Alumni Table */}
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  {isAlumniLoading ? (
                    <div className="p-8 text-center text-xs text-slate-400">Loading alumni records...</div>
                  ) : alumniData?.alumni?.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">No matching alumni found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Alumnus</th>
                            <th className="p-3">Company & Role</th>
                            <th className="p-3">Department & Batch</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {alumniData?.alumni?.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50/60">
                              <td className="p-3">
                                <div className="font-semibold text-slate-900">{a.fullName}</div>
                                <div className="text-slate-500 text-[11px]">{a.email}</div>
                              </td>
                              <td className="p-3">
                                <div className="font-semibold text-purple-900">
                                  {a.alumniProfile?.currentCompany || 'Not specified'}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {a.alumniProfile?.currentDesignation || '—'}
                                </div>
                              </td>
                              <td className="p-3">
                                <div>{a.alumniProfile?.department}</div>
                                <div className="text-[11px] text-slate-500">
                                  Class of {a.alumniProfile?.graduationYear} •{' '}
                                  {a.alumniProfile?.rollNumber || 'No USN'}
                                </div>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    a.status === 'VERIFIED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : a.status === 'PENDING_VERIFICATION'
                                      ? 'bg-amber-100 text-amber-800'
                                      : a.status === 'REJECTED'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-slate-200 text-slate-800'
                                  }`}
                                >
                                  {a.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-3 text-right space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7"
                                  onClick={() => setSelectedAlumni(a)}
                                >
                                  Details
                                </Button>
                                {a.status === 'PENDING_VERIFICATION' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                                      onClick={() =>
                                        setReviewModalState({
                                          isOpen: true,
                                          type: 'ALUMNI',
                                          id: a.id,
                                          userName: a.fullName,
                                          userEmail: a.email,
                                          decision: 'APPROVE',
                                          reason: '',
                                        })
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-7 text-rose-600 border-rose-200"
                                      onClick={() =>
                                        setReviewModalState({
                                          isOpen: true,
                                          type: 'ALUMNI',
                                          id: a.id,
                                          userName: a.fullName,
                                          userEmail: a.email,
                                          decision: 'REJECT',
                                          reason: '',
                                        })
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {a.status === 'VERIFIED' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 text-amber-700 border-amber-300 hover:bg-amber-50"
                                    onClick={() =>
                                      setModerationModalState({
                                        isOpen: true,
                                        action: 'SUSPEND',
                                        userId: a.id,
                                        userName: a.fullName,
                                        userEmail: a.email,
                                        reason: '',
                                      })
                                    }
                                  >
                                    Suspend
                                  </Button>
                                )}
                                {(a.status === 'SUSPENDED' || a.status === 'REJECTED') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                    onClick={() =>
                                      setModerationModalState({
                                        isOpen: true,
                                        action: 'REINSTATE',
                                        userId: a.id,
                                        userName: a.fullName,
                                        userEmail: a.email,
                                        reason: '',
                                      })
                                    }
                                  >
                                    Reinstate
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 5: APPEALS & RECONSIDERATION */}
          {/* ============================================================= */}
          {activeTab === 'appeals' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-navy-950">Account Appeals & Reconsideration</h2>
                  <p className="text-xs text-slate-500">
                    Review and adjudicate formal statements submitted by rejected or suspended users
                  </p>
                </div>

                <select
                  value={appealStatusFilter}
                  onChange={(e) => setAppealStatusFilter(e.target.value)}
                  className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ALL">All Appeal States</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="APPROVED">Approved / Reinstated</option>
                  <option value="REJECTED">Denied</option>
                </select>
              </div>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  {isAppealsLoading ? (
                    <div className="p-8 text-center text-xs text-slate-400">Loading appeal cases...</div>
                  ) : appealsData?.appeals?.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No appeal submissions found under current filter.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">User & Role</th>
                            <th className="p-3">Action Appealed</th>
                            <th className="p-3">Appeal Statement</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {appealsData?.appeals?.map((appeal) => (
                            <tr key={appeal.id} className="hover:bg-slate-50/60">
                              <td className="p-3">
                                <div className="font-semibold text-slate-900">{appeal.user.fullName}</div>
                                <div className="text-slate-500 text-[11px]">{appeal.user.email}</div>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {appeal.user.role}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-slate-700">
                                {appeal.actionAppealed.replace('_', ' ')}
                              </td>
                              <td className="p-3 max-w-xs">
                                <p className="text-slate-600 line-clamp-2">{appeal.appealStatement}</p>
                                {appeal.supplementalDocUrl && (
                                  <a
                                    href={appeal.supplementalDocUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 mt-1"
                                  >
                                    <ExternalLink className="h-3 w-3" /> View Evidence
                                  </a>
                                )}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    appeal.status === 'PENDING'
                                      ? 'bg-amber-100 text-amber-800'
                                      : appeal.status === 'APPROVED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {appeal.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {appeal.status === 'PENDING' ? (
                                  <div className="space-x-1">
                                    <Button
                                      size="sm"
                                      className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                                      onClick={() =>
                                        setAppealModalState({
                                          isOpen: true,
                                          appealId: appeal.id,
                                          userName: appeal.user.fullName,
                                          actionAppealed: appeal.actionAppealed,
                                          decision: 'APPROVE',
                                          resolutionVerdict: '',
                                        })
                                      }
                                    >
                                      Grant Reinstatement
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-7 text-rose-600 border-rose-200"
                                      onClick={() =>
                                        setAppealModalState({
                                          isOpen: true,
                                          appealId: appeal.id,
                                          userName: appeal.user.fullName,
                                          actionAppealed: appeal.actionAppealed,
                                          decision: 'REJECT',
                                          resolutionVerdict: '',
                                        })
                                      }
                                    >
                                      Dismiss
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400">Resolved</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 6: ANNOUNCEMENTS MANAGEMENT */}
          {/* ============================================================= */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-navy-950">Campus Announcements</h2>
                  <p className="text-xs text-slate-500">
                    Publish urgent circulars, career notices, and alumni meet circulars
                  </p>
                </div>

                <Button
                  size="sm"
                  className="bg-navy-900 hover:bg-navy-800 text-white text-xs gap-1.5"
                  onClick={() =>
                    setAnnouncementModalState({
                      isOpen: true,
                      isEditing: false,
                      title: '',
                      category: 'GENERAL_CIRCULAR',
                      content: '',
                      targetAudience: 'ALL',
                      targetDepartment: '',
                      priority: 'NORMAL',
                      status: 'PUBLISHED',
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Announcement</span>
                </Button>
              </div>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  {isAnnouncementsLoading ? (
                    <div className="p-8 text-center text-xs text-slate-400">Loading announcements...</div>
                  ) : announcementsData?.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No announcements published yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {announcementsData?.map((a) => (
                        <div key={a.id} className="p-4 hover:bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1 max-w-2xl">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  a.priority === 'URGENT'
                                    ? 'bg-rose-100 text-rose-800'
                                    : a.priority === 'HIGH'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {a.priority}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  a.status === 'PUBLISHED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {a.status}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                Target: {a.targetAudience.replace('_', ' ')}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm">{a.title}</h3>
                            <p className="text-xs text-slate-600 line-clamp-2">{a.content}</p>
                            <div className="text-[10px] text-slate-400">
                              By {a.authorAdmin?.user?.fullName || 'CDC Admin'} •{' '}
                              {new Date(a.publishedAt || a.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() =>
                                toggleAnnouncementStatusMutation.mutate({
                                  id: a.id,
                                  status: a.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                                })
                              }
                            >
                              {a.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() =>
                                setAnnouncementModalState({
                                  isOpen: true,
                                  isEditing: true,
                                  id: a.id,
                                  title: a.title,
                                  category: a.category,
                                  content: a.content,
                                  targetAudience: a.targetAudience,
                                  targetDepartment: a.targetDepartment || '',
                                  priority: a.priority,
                                  status: a.status,
                                })
                              }
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 text-rose-600 border-rose-200 hover:bg-rose-50"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this announcement?')) {
                                  deleteAnnouncementMutation.mutate(a.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 7: AUDIT LOGS */}
          {/* ============================================================= */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-navy-950">Administrative Audit Trail</h2>
                  <p className="text-xs text-slate-500">
                    Tamper-evident system activity log recording all reviews, suspensions, and notices
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search action, reason, target ID..."
                    value={auditLogSearch}
                    onChange={(e) => setAuditLogSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>

                <div>
                  <select
                    value={auditLogActionFilter}
                    onChange={(e) => setAuditLogActionFilter(e.target.value)}
                    className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="ALL">All Action Types</option>
                    <option value="USER_APPROVE">USER_APPROVE</option>
                    <option value="USER_REJECT">USER_REJECT</option>
                    <option value="USER_SUSPEND">USER_SUSPEND</option>
                    <option value="USER_REINSTATE">USER_REINSTATE</option>
                    <option value="ANNOUNCEMENT_CREATE">ANNOUNCEMENT_CREATE</option>
                    <option value="ANNOUNCEMENT_UPDATE">ANNOUNCEMENT_UPDATE</option>
                    <option value="ANNOUNCEMENT_PUBLISH">ANNOUNCEMENT_PUBLISH</option>
                    <option value="ANNOUNCEMENT_DELETE">ANNOUNCEMENT_DELETE</option>
                    <option value="APPEAL_RESOLVE">APPEAL_RESOLVE</option>
                  </select>
                </div>
              </div>

              {/* Logs Table */}
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  {isAuditLogsLoading ? (
                    <div className="p-8 text-center text-xs text-slate-400">Loading audit trail...</div>
                  ) : auditLogsData?.logs?.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">No audit records found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Action</th>
                            <th className="p-3">Admin Actor</th>
                            <th className="p-3">Target</th>
                            <th className="p-3">Justification / Reason</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3 text-right">Inspect</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {auditLogsData?.logs?.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/60">
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    log.action.includes('APPROVE')
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : log.action.includes('REJECT')
                                      ? 'bg-rose-100 text-rose-800'
                                      : log.action.includes('SUSPEND')
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="font-semibold text-slate-900">
                                  {log.admin.name || log.admin.employeeId}
                                </div>
                                <div className="text-[10px] text-slate-400">{log.admin.email}</div>
                              </td>
                              <td className="p-3">
                                <span className="font-mono text-[11px] text-slate-700">
                                  {log.targetType}
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {log.targetId.slice(0, 10)}...
                                </div>
                              </td>
                              <td className="p-3 max-w-xs text-slate-600 line-clamp-2">
                                {log.reason}
                              </td>
                              <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleString()}
                              </td>
                              <td className="p-3 text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs h-7 text-brand-600"
                                  onClick={() => setSelectedAuditLog(log)}
                                >
                                  Details
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
            </div>
          )}
        </main>
      </div>

      {/* ============================================================= */}
      {/* MODAL 1: STUDENT DETAILS */}
      {/* ============================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                  {selectedStudent.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-navy-950 text-base">{selectedStudent.fullName}</h3>
                  <p className="text-xs text-slate-500">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium">USN / Registration Number</span>
                <div className="text-sm font-bold font-mono text-blue-900 mt-0.5">
                  {selectedStudent.studentProfile?.rollNumber || 'Not provided'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium">Account Status</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedStudent.status}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium">Department</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedStudent.studentProfile?.department}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium">Degree & Expected Graduation</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedStudent.studentProfile?.degree} • Class of{' '}
                  {selectedStudent.studentProfile?.expectedGraduationYear}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium">Current Semester</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  Semester {selectedStudent.studentProfile?.currentSemester || '—'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium">Phone Number</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedStudent.phoneNumber || 'Not provided'}
                </div>
              </div>
            </div>

            {selectedStudent.studentProfile?.bio && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs">
                <span className="text-slate-400 font-medium">Bio</span>
                <p className="mt-1 text-slate-700">{selectedStudent.studentProfile.bio}</p>
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
              {selectedStudent.status === 'PENDING_VERIFICATION' && (
                <>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      setReviewModalState({
                        isOpen: true,
                        type: 'STUDENT',
                        id: selectedStudent.id,
                        userName: selectedStudent.fullName,
                        userEmail: selectedStudent.email,
                        decision: 'APPROVE',
                        reason: '',
                      });
                      setSelectedStudent(null);
                    }}
                  >
                    Approve Student
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-600 border-rose-200"
                    onClick={() => {
                      setReviewModalState({
                        isOpen: true,
                        type: 'STUDENT',
                        id: selectedStudent.id,
                        userName: selectedStudent.fullName,
                        userEmail: selectedStudent.email,
                        decision: 'REJECT',
                        reason: '',
                      });
                      setSelectedStudent(null);
                    }}
                  >
                    Reject Student
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 2: ALUMNI DETAILS */}
      {/* ============================================================= */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                  {selectedAlumni.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-navy-950 text-base">{selectedAlumni.fullName}</h3>
                  <p className="text-xs text-slate-500">{selectedAlumni.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlumni(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium">Current Company & Role</span>
                <div className="text-sm font-bold text-purple-900 mt-0.5">
                  {selectedAlumni.alumniProfile?.currentCompany || 'Not specified'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {selectedAlumni.alumniProfile?.currentDesignation || '—'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium">Graduation Year & Degree</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  Class of {selectedAlumni.alumniProfile?.graduationYear}
                </div>
                <div className="text-[11px] text-slate-500">
                  {selectedAlumni.alumniProfile?.degree} • {selectedAlumni.alumniProfile?.department}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium">University Roll No / USN</span>
                <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                  {selectedAlumni.alumniProfile?.rollNumber || 'Not provided'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium">Industry & Experience</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedAlumni.alumniProfile?.industry || 'Technology'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {selectedAlumni.alumniProfile?.yearsOfExperience || 0} years professional experience
                </div>
              </div>
            </div>

            {selectedAlumni.alumniProfile?.bio && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs">
                <span className="text-slate-400 font-medium">Professional Bio</span>
                <p className="mt-1 text-slate-700">{selectedAlumni.alumniProfile.bio}</p>
              </div>
            )}

            {selectedAlumni.alumniProfile?.linkedinUrl && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                <span className="text-slate-500">LinkedIn Profile:</span>
                <a
                  href={selectedAlumni.alumniProfile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View LinkedIn
                </a>
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedAlumni(null)}>
                Close
              </Button>
              {selectedAlumni.status === 'PENDING_VERIFICATION' && (
                <>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      setReviewModalState({
                        isOpen: true,
                        type: 'ALUMNI',
                        id: selectedAlumni.id,
                        userName: selectedAlumni.fullName,
                        userEmail: selectedAlumni.email,
                        decision: 'APPROVE',
                        reason: '',
                      });
                      setSelectedAlumni(null);
                    }}
                  >
                    Approve Alumnus
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-600 border-rose-200"
                    onClick={() => {
                      setReviewModalState({
                        isOpen: true,
                        type: 'ALUMNI',
                        id: selectedAlumni.id,
                        userName: selectedAlumni.fullName,
                        userEmail: selectedAlumni.email,
                        decision: 'REJECT',
                        reason: '',
                      });
                      setSelectedAlumni(null);
                    }}
                  >
                    Reject Alumnus
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 3: REVIEW DECISION (APPROVE OR REJECT WITH REASON) */}
      {/* ============================================================= */}
      {reviewModalState?.isOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {reviewModalState.decision === 'APPROVE' ? (
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                    <XCircle className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-navy-950 text-base">
                    {reviewModalState.decision === 'APPROVE'
                      ? 'Approve Institutional Verification'
                      : 'Reject Account Verification'}
                  </h3>
                  <p className="text-xs text-slate-500">{reviewModalState.userName}</p>
                </div>
              </div>
              <button
                onClick={() => setReviewModalState(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {reviewModalState.decision === 'APPROVE'
                ? `You are certifying that ${reviewModalState.userName}'s academic and identity credentials match college registrar records. This enables full platform access.`
                : `Please provide a clear and respectful explanation for rejecting this account. This statement will be recorded in the audit log and made accessible to the applicant for appeal.`}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {reviewModalState.decision === 'APPROVE'
                  ? 'Verification Approval Note (Optional):'
                  : 'Rejection Reason (Required, min 5 chars):'}
              </label>
              <textarea
                rows={3}
                value={reviewModalState.reason}
                onChange={(e) =>
                  setReviewModalState({ ...reviewModalState, reason: e.target.value })
                }
                placeholder={
                  reviewModalState.decision === 'APPROVE'
                    ? 'e.g. Academic roll number and credentials verified via registrar registry.'
                    : 'e.g. USN does not match the department enrolled for the specified graduation year.'
                }
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setReviewModalState(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className={
                  reviewModalState.decision === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }
                disabled={
                  (reviewModalState.decision === 'REJECT' &&
                    reviewModalState.reason.trim().length < 5) ||
                  reviewStudentMutation.isPending ||
                  reviewAlumniMutation.isPending
                }
                onClick={() => {
                  if (reviewModalState.type === 'STUDENT') {
                    reviewStudentMutation.mutate({
                      id: reviewModalState.id,
                      decision: reviewModalState.decision,
                      reason: reviewModalState.reason,
                    });
                  } else {
                    reviewAlumniMutation.mutate({
                      id: reviewModalState.id,
                      decision: reviewModalState.decision,
                      reason: reviewModalState.reason,
                    });
                  }
                }}
              >
                Confirm {reviewModalState.decision === 'APPROVE' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 4: MODERATION (SUSPEND / REINSTATE) */}
      {/* ============================================================= */}
      {moderationModalState?.isOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-lg ${
                    moderationModalState.action === 'SUSPEND'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {moderationModalState.action === 'SUSPEND' ? (
                    <Lock className="h-5 w-5" />
                  ) : (
                    <Unlock className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-navy-950 text-base">
                    {moderationModalState.action === 'SUSPEND'
                      ? 'Suspend User Account'
                      : 'Reinstate User Account'}
                  </h3>
                  <p className="text-xs text-slate-500">{moderationModalState.userName}</p>
                </div>
              </div>
              <button
                onClick={() => setModerationModalState(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Administrative Justification (Mandatory, min 5 chars):
              </label>
              <textarea
                rows={3}
                value={moderationModalState.reason}
                onChange={(e) =>
                  setModerationModalState({ ...moderationModalState, reason: e.target.value })
                }
                placeholder="Reason for suspension or reinstatement..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setModerationModalState(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className={
                  moderationModalState.action === 'SUSPEND'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }
                disabled={
                  moderationModalState.reason.trim().length < 5 ||
                  suspendMutation.isPending ||
                  reinstateMutation.isPending
                }
                onClick={() => {
                  if (moderationModalState.action === 'SUSPEND') {
                    suspendMutation.mutate({
                      userId: moderationModalState.userId,
                      reason: moderationModalState.reason,
                    });
                  } else {
                    reinstateMutation.mutate({
                      userId: moderationModalState.userId,
                      reason: moderationModalState.reason,
                    });
                  }
                }}
              >
                Confirm {moderationModalState.action === 'SUSPEND' ? 'Suspension' : 'Reinstatement'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 5: APPEAL RESOLUTION */}
      {/* ============================================================= */}
      {appealModalState?.isOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-navy-950 text-base">
                {appealModalState.decision === 'APPROVE' ? 'Grant Appeal' : 'Dismiss Appeal'}:{' '}
                {appealModalState.userName}
              </h3>
              <button
                onClick={() => setAppealModalState(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {appealModalState.decision === 'APPROVE'
                ? 'Approving this appeal will reinstate the user account to VERIFIED status.'
                : 'Dismissing this appeal confirms the existing rejection or suspension.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Resolution Verdict & Finding (Min 5 chars):
              </label>
              <textarea
                rows={3}
                value={appealModalState.resolutionVerdict}
                onChange={(e) =>
                  setAppealModalState({ ...appealModalState, resolutionVerdict: e.target.value })
                }
                placeholder="State the formal rationale for this determination..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setAppealModalState(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className={
                  appealModalState.decision === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }
                disabled={
                  appealModalState.resolutionVerdict.trim().length < 5 ||
                  resolveAppealMutation.isPending
                }
                onClick={() => {
                  resolveAppealMutation.mutate({
                    appealId: appealModalState.appealId,
                    decision: appealModalState.decision,
                    resolutionVerdict: appealModalState.resolutionVerdict,
                  });
                }}
              >
                Confirm Verdict
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 6: CREATE / EDIT ANNOUNCEMENT */}
      {/* ============================================================= */}
      {announcementModalState?.isOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-navy-950 text-base">
                {announcementModalState.isEditing ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>
              <button
                onClick={() => setAnnouncementModalState(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={announcementModalState.title}
                  onChange={(e) =>
                    setAnnouncementModalState({ ...announcementModalState, title: e.target.value })
                  }
                  placeholder="e.g. Annual Alumni Convocation Registration Open"
                  className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={announcementModalState.category}
                    onChange={(e) =>
                      setAnnouncementModalState({
                        ...announcementModalState,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="GENERAL_CIRCULAR">General Circular</option>
                    <option value="PLACEMENT_UPDATE">Placement Update</option>
                    <option value="ALUMNI_MEET_NOTICE">Alumni Meet Notice</option>
                    <option value="ACADEMIC_CALENDAR">Academic Calendar</option>
                    <option value="DEPARTMENTAL">Departmental</option>
                    <option value="URGENT">Urgent Alert</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Audience</label>
                  <select
                    value={announcementModalState.targetAudience}
                    onChange={(e) =>
                      setAnnouncementModalState({
                        ...announcementModalState,
                        targetAudience: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="ALL">Entire Campus (Students & Alumni)</option>
                    <option value="STUDENTS_ONLY">Students Only</option>
                    <option value="ALUMNI_ONLY">Alumni Only</option>
                    <option value="DEPARTMENT_SPECIFIC">Department Specific</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={announcementModalState.priority}
                    onChange={(e) =>
                      setAnnouncementModalState({
                        ...announcementModalState,
                        priority: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Alert</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Publish Status</label>
                  <select
                    value={announcementModalState.status}
                    onChange={(e) =>
                      setAnnouncementModalState({
                        ...announcementModalState,
                        status: e.target.value,
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="PUBLISHED">Published (Visible immediately)</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Content</label>
                <textarea
                  rows={5}
                  value={announcementModalState.content}
                  onChange={(e) =>
                    setAnnouncementModalState({
                      ...announcementModalState,
                      content: e.target.value,
                    })
                  }
                  placeholder="Detailed announcement statement..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setAnnouncementModalState(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-navy-900 hover:bg-navy-800 text-white"
                disabled={
                  announcementModalState.title.trim().length < 3 ||
                  announcementModalState.content.trim().length < 10 ||
                  createAnnouncementMutation.isPending ||
                  updateAnnouncementMutation.isPending
                }
                onClick={() => {
                  if (announcementModalState.isEditing && announcementModalState.id) {
                    updateAnnouncementMutation.mutate({
                      id: announcementModalState.id,
                      payload: {
                        title: announcementModalState.title,
                        category: announcementModalState.category,
                        content: announcementModalState.content,
                        targetAudience: announcementModalState.targetAudience,
                        priority: announcementModalState.priority,
                        status: announcementModalState.status,
                      },
                    });
                  } else {
                    createAnnouncementMutation.mutate({
                      title: announcementModalState.title,
                      category: announcementModalState.category,
                      content: announcementModalState.content,
                      targetAudience: announcementModalState.targetAudience,
                      priority: announcementModalState.priority,
                      status: announcementModalState.status,
                    });
                  }
                }}
              >
                {announcementModalState.isEditing ? 'Save Changes' : 'Publish Announcement'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 7: AUDIT LOG INSPECT */}
      {/* ============================================================= */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-navy-950 text-base">Audit Record Inspector</h3>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">Action:</span>
                  <div className="font-bold text-slate-800">{selectedAuditLog.action}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">Target Type:</span>
                  <div className="font-bold text-slate-800">{selectedAuditLog.targetType}</div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400">Reason / Justification:</span>
                <p className="font-medium text-slate-800 mt-0.5">{selectedAuditLog.reason}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400">Performed By:</span>
                <div className="font-bold text-slate-800">
                  {selectedAuditLog.admin.name || selectedAuditLog.admin.employeeId} (
                  {selectedAuditLog.admin.email})
                </div>
                <div className="text-[11px] text-slate-500">{selectedAuditLog.admin.department}</div>
              </div>

              {selectedAuditLog.previousState && (
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">Previous State:</span>
                  <pre className="font-mono text-[10px] text-slate-700 overflow-x-auto mt-0.5">
                    {selectedAuditLog.previousState}
                  </pre>
                </div>
              )}

              {selectedAuditLog.newState && (
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">New State:</span>
                  <pre className="font-mono text-[10px] text-slate-700 overflow-x-auto mt-0.5">
                    {selectedAuditLog.newState}
                  </pre>
                </div>
              )}

              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-[11px] text-slate-500">
                <span>IP: {selectedAuditLog.ipAddress || '127.0.0.1'}</span>
                <span>{new Date(selectedAuditLog.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-right">
              <Button size="sm" variant="outline" onClick={() => setSelectedAuditLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
