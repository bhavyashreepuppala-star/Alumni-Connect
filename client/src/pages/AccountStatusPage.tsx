import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  User,
  Mail,
  BookOpen,
  Calendar,
  Phone,
  FileText,
  LogOut,
  ArrowRight,
  Edit3,
  Check,
  AlertCircle,
  Building2,
  Briefcase,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { api } from '../lib/api';
import { getStoredUser, clearSession } from '../lib/auth';

export const AccountStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const isAlumni = storedUser?.role === 'ALUMNI';

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Edit details state (permitted fields while pending)
  const [isEditing, setIsEditing] = useState(false);
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editLinkedinUrl, setEditLinkedinUrl] = useState('');
  const [editPortfolioUrl, setEditPortfolioUrl] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editMentorshipTopics, setEditMentorshipTopics] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Appeal state (for rejected accounts)
  const [appealStatement, setAppealStatement] = useState('');
  const [appealDocUrl, setAppealDocUrl] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [appealSuccessMsg, setAppealSuccessMsg] = useState('');
  const [appealErrorMsg, setAppealErrorMsg] = useState('');

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      let res: any;
      if (isAlumni) {
        res = await api.getAlumniVerificationStatus();
        setEditCompany(res.currentCompany || '');
        setEditDesignation(res.currentDesignation || '');
        setEditCity(res.city || '');
        setEditCountry(res.country || '');
        setEditMentorshipTopics(res.mentorshipTopics || '');
      } else {
        res = await api.getStudentVerificationStatus();
        setEditHeadline(res.headline || '');
        setEditGithubUrl(res.githubUrl || '');
        setEditPortfolioUrl('');
      }

      setData(res);
      setEditPhoneNumber(res.phoneNumber || '');
      setEditBio(res.bio || '');
      setEditLinkedinUrl(res.linkedinUrl || '');
    } catch (err: any) {
      console.error('Failed to fetch verification status:', err);
      setErrorMessage(err.message || 'Unable to load account verification record.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!api.getToken()) {
      navigate('/login');
      return;
    }
    fetchStatus();
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const handleSavePermittedDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      if (isAlumni) {
        await api.updateAlumniProfile({
          phoneNumber: editPhoneNumber.trim() || undefined,
          currentCompany: editCompany.trim() || undefined,
          currentDesignation: editDesignation.trim() || undefined,
          city: editCity.trim() || undefined,
          country: editCountry.trim() || undefined,
          bio: editBio.trim() || undefined,
          linkedinUrl: editLinkedinUrl.trim() || undefined,
          mentorshipTopics: editMentorshipTopics.trim() || undefined,
        });
      } else {
        await api.updateStudentProfile({
          phoneNumber: editPhoneNumber.trim() || undefined,
          headline: editHeadline.trim() || undefined,
          bio: editBio.trim() || undefined,
          githubUrl: editGithubUrl.trim() || undefined,
          linkedinUrl: editLinkedinUrl.trim() || undefined,
          portfolioUrl: editPortfolioUrl.trim() || undefined,
        });
      }

      setSaveSuccessMsg('Profile details successfully updated in institutional database.');
      setIsEditing(false);
      await fetchStatus();
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to update details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealStatement.trim()) {
      setAppealErrorMsg('Please state the basis for your verification reconsideration request.');
      return;
    }

    setIsSubmittingAppeal(true);
    setAppealSuccessMsg('');
    setAppealErrorMsg('');

    try {
      if (isAlumni) {
        await api.submitAlumniVerificationAppeal(appealStatement.trim(), appealDocUrl.trim() || undefined);
      } else {
        await api.submitVerificationAppeal(appealStatement.trim(), appealDocUrl.trim() || undefined);
      }
      setAppealSuccessMsg('Your appeal has been submitted to the administration review board.');
      setAppealStatement('');
      setAppealDocUrl('');
      await fetchStatus();
    } catch (err: any) {
      setAppealErrorMsg(err.message || 'Failed to submit appeal.');
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Retrieving institutional verification status...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center shadow-lg border-slate-200">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-navy-950 mb-2">Verification Record Unavailable</h2>
          <p className="text-xs text-slate-600 mb-6">{errorMessage || 'Could not retrieve your account record.'}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={() => fetchStatus()}>
              Retry
            </Button>
            <Button variant="navy" size="sm" onClick={handleLogout}>
              Return to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { accountStatus, rollNumber, department, degree, expectedGraduationYear, graduationYear } = data;
  const batchYear = graduationYear || expectedGraduationYear;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Institutional Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
                <GraduationCap className="h-5 w-5 text-brand-400" />
              </div>
              <span className="font-bold text-navy-950 text-base">ALUMNI CONNECT</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {isAlumni ? 'Alumni Credential Portal' : 'Student Credential Portal'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Signed in: <strong className="text-navy-950">{data.email}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs border-slate-300 gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner based on Status */}
        {accountStatus === 'PENDING_VERIFICATION' && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                <Clock className="h-8 w-8 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-navy-950">
                    Institutional Verification in Progress
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-300">
                    PENDING REVIEW
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {isAlumni ? (
                    <>
                      Your alumni registration has been safely recorded in the college database. Before unrestricted access to the
                      Alumni Mentorship Hub, student requests, and campus networking is granted, your graduation records and degree
                      credentials must be verified by the Alumni Relations Office / Career Development Center.
                    </>
                  ) : (
                    <>
                      Your student registration has been safely recorded in the college database. Before unrestricted access to alumni
                      directories, 1-on-1 mentorship, and campus networking is granted, your college affiliation and USN must be verified
                      by the College Administration / Career Development Center.
                    </>
                  )}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-800">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  <span>Administrative verification queues are reviewed sequentially during official academic hours.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {accountStatus === 'VERIFIED' && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-navy-950">
                      Affiliation Verified & In Good Standing
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900 border border-emerald-300">
                      VERIFIED
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">
                    Your institutional credentials have been confirmed. You hold full access to all certified networking features.
                  </p>
                </div>
              </div>
              <Link to={isAlumni ? '/dashboard/alumni' : '/dashboard/student'}>
                <Button variant="navy" className="gap-2 shrink-0">
                  <span>{isAlumni ? 'Enter Alumni Mentorship Hub' : 'Enter Student Dashboard'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {accountStatus === 'REJECTED' && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center text-red-700 shrink-0">
                <XCircle className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-navy-950">
                    Verification Not Approved
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-200 text-red-900 border border-red-300">
                    REJECTED
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  The institutional verification team was unable to confirm your academic records against university convocation archives.
                </p>
                {data.verification?.publicReviewReason && (
                  <div className="mt-3 rounded-lg bg-white p-3.5 border border-red-200 text-xs text-red-900">
                    <strong>Reason specified by administrative reviewer:</strong>
                    <p className="mt-1 text-slate-800">{data.verification.publicReviewReason}</p>
                  </div>
                )}
                <p className="mt-3 text-xs text-slate-600">
                  If this was in error, you may submit an appeal below along with your university registration proof.
                </p>
              </div>
            </div>
          </div>
        )}

        {accountStatus === 'SUSPENDED' && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50/90 p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-rose-200 border border-rose-300 flex items-center justify-center text-rose-800 shrink-0">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-navy-950">
                    Account Access Suspended
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-200 text-rose-900 border border-rose-300">
                    SUSPENDED
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-800">
                  This account has been temporarily restricted by college administration pursuant to institutional policy.
                  Access to networking, messaging, and mentorship sessions is disabled.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-white border border-rose-200 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-rose-900">Required Action:</p>
                  <p>Please contact the Career Development Center or Alumni Relations Office in person or via institutional email.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Snapshot & Permitted Corrections Card */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg text-navy-950">Submitted Institutional Profile</CardTitle>
              <CardDescription>
                Details submitted during registration and stored in the institutional database
              </CardDescription>
            </div>
            {accountStatus === 'PENDING_VERIFICATION' && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-xs border-slate-300 gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Update Contact Details</span>
              </Button>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {saveSuccessMsg && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}
            {saveErrorMsg && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{saveErrorMsg}</span>
              </div>
            )}

            {/* Read-only Institutional Core Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Full Name
                </span>
                <span className="text-sm font-bold text-navy-950 mt-0.5 block">
                  {data.fullName || 'Not provided'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Registered Email
                </span>
                <span className="text-sm font-semibold text-navy-950 mt-0.5 block truncate">
                  {data.email}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  USN / Registration ID
                </span>
                <span className="text-sm font-mono font-bold text-navy-950 mt-0.5 block">
                  {rollNumber || 'On Record'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Locked institutional credential</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Department
                </span>
                <span className="text-sm font-semibold text-navy-950 mt-0.5 block">
                  {department}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Degree / Program
                </span>
                <span className="text-sm font-semibold text-navy-950 mt-0.5 block">
                  {degree}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Graduation Batch
                </span>
                <span className="text-sm font-semibold text-navy-950 mt-0.5 block">
                  Class of {batchYear}
                </span>
              </div>

              {isAlumni && (
                <>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Current Company
                    </span>
                    <span className="text-sm font-semibold text-navy-950 mt-0.5 block">
                      {data.currentCompany || 'Not added'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Designation / Role
                    </span>
                    <span className="text-sm font-semibold text-navy-950 mt-0.5 block">
                      {data.currentDesignation || 'Not added'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Location
                    </span>
                    <span className="text-sm font-semibold text-navy-950 mt-0.5 block">
                      {[data.city, data.country].filter(Boolean).join(', ') || 'Not added'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Permitted Profile Edit Form (When editing) */}
            {isEditing ? (
              <form onSubmit={handleSavePermittedDetails} className="border-t border-slate-200 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-navy-950">Update Permitted Profile Information</h3>
                  <span className="text-[11px] text-slate-400">Institutional credentials remain locked</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number (Optional)"
                    placeholder="+91 98765 43210"
                    value={editPhoneNumber}
                    onChange={(e) => setEditPhoneNumber(e.target.value)}
                  />

                  {isAlumni ? (
                    <>
                      <Input
                        label="Current Company"
                        placeholder="e.g. Google, Microsoft, Stripe"
                        value={editCompany}
                        onChange={(e) => setEditCompany(e.target.value)}
                      />
                      <Input
                        label="Current Designation"
                        placeholder="e.g. Staff Software Engineer"
                        value={editDesignation}
                        onChange={(e) => setEditDesignation(e.target.value)}
                      />
                      <Input
                        label="Current City"
                        placeholder="e.g. San Francisco / Bengaluru"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                      />
                      <Input
                        label="Country"
                        placeholder="e.g. United States / India"
                        value={editCountry}
                        onChange={(e) => setEditCountry(e.target.value)}
                      />
                      <Input
                        label="Mentorship Focus Topics"
                        placeholder="e.g. System Design, Resume Reviews"
                        value={editMentorshipTopics}
                        onChange={(e) => setEditMentorshipTopics(e.target.value)}
                      />
                    </>
                  ) : (
                    <Input
                      label="Headline / Focus (Optional)"
                      placeholder="e.g. 3rd-year CS student interested in Systems & Cloud"
                      value={editHeadline}
                      onChange={(e) => setEditHeadline(e.target.value)}
                    />
                  )}

                  <Input
                    label="LinkedIn Profile URL (Optional)"
                    placeholder="https://linkedin.com/in/yourhandle"
                    value={editLinkedinUrl}
                    onChange={(e) => setEditLinkedinUrl(e.target.value)}
                  />

                  {!isAlumni && (
                    <Input
                      label="GitHub Profile URL (Optional)"
                      placeholder="https://github.com/yourhandle"
                      value={editGithubUrl}
                      onChange={(e) => setEditGithubUrl(e.target.value)}
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Bio / About You</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe your background and project interests..."
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setSaveErrorMsg('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="navy"
                    size="sm"
                    isLoading={isSaving}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Phone Number:</span>
                  <span className="font-medium text-slate-700">{data.phoneNumber || 'Not supplied'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAlumni ? 'LinkedIn Profile:' : 'Professional Headline:'}</span>
                  <span className="font-medium text-slate-700">{data.linkedinUrl || data.headline || 'None added'}</span>
                </div>
                {data.bio && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block">Bio:</span>
                    <p className="font-medium text-slate-700 mt-0.5">{data.bio}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50/70 border-t border-slate-200 text-xs text-slate-500 py-3">
            <span>
              Need to correct your institutional degree, department, or graduation year? Contact the Alumni Relations Office or Registrar.
            </span>
          </CardFooter>
        </Card>

        {/* Appeal Form for Rejected Accounts */}
        {accountStatus === 'REJECTED' && (
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-navy-950">Verification Reconsideration & Appeal</CardTitle>
              <CardDescription>
                If you believe your application was rejected in error, submit an appeal statement for administrative review
              </CardDescription>
            </CardHeader>

            <CardContent>
              {data.appeal ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-950">Active Appeal on Record</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                      Status: {data.appeal.status}
                    </span>
                  </div>
                  <p className="text-slate-700">
                    <strong>Your submitted statement:</strong> {data.appeal.appealStatement}
                  </p>
                  {data.appeal.verdict && (
                    <p className="text-slate-800">
                      <strong>Review Verdict:</strong> {data.appeal.verdict}
                    </p>
                  )}
                  <p className="text-slate-400 text-[10px]">Submitted: {new Date(data.appeal.createdAt).toLocaleDateString()}</p>
                </div>
              ) : (
                <form onSubmit={handleAppealSubmit} className="space-y-4">
                  {appealSuccessMsg && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                      {appealSuccessMsg}
                    </div>
                  )}
                  {appealErrorMsg && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
                      {appealErrorMsg}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Appeal Statement / Explanation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Explain your enrollment or graduation details and provide any reference information that confirms your degree affiliation..."
                      value={appealStatement}
                      onChange={(e) => setAppealStatement(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <Input
                    label="Link to Degree Proof / Transcript / Convocation Certificate (Optional)"
                    placeholder="https://drive.google.com/... or institutional document link"
                    value={appealDocUrl}
                    onChange={(e) => setAppealDocUrl(e.target.value)}
                  />

                  <Button
                    type="submit"
                    variant="navy"
                    size="sm"
                    isLoading={isSubmittingAppeal}
                    className="font-semibold"
                  >
                    Submit Reconsideration Appeal
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Security & Access Protection FAQ */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-600 space-y-2">
          <h4 className="font-bold text-navy-950 text-sm flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            <span>Why is institutional verification required?</span>
          </h4>
          <p>
            Alumni Connect is a genuine college networking platform for both current students and graduated alumni.
            To protect community privacy, prevent impersonation, and guarantee authentic career mentorship, access to
            the full directory, messaging, and 1-on-1 sessions is strictly limited to verified institution members.
          </p>
        </div>
      </main>
    </div>
  );
};
