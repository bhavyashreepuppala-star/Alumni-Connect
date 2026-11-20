import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Hash,
  BookOpen,
  Calendar,
  Building2,
  Phone,
  Lock,
  Clock,
  ArrowLeft,
  Info,
  Check,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { api, StudentRegistrationResponse } from '../lib/api';

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence and Data Science',
  'Chemical Engineering',
  'Biotechnology',
  'School of Management & Business',
];

const DEGREES = [
  'B.Tech (Bachelor of Technology)',
  'B.E. (Bachelor of Engineering)',
  'M.Tech (Master of Technology)',
  'M.E. (Master of Engineering)',
  'BCA (Bachelor of Computer Applications)',
  'MCA (Master of Computer Applications)',
  'B.Sc (Bachelor of Science)',
  'M.Sc (Master of Science)',
  'MBA (Master of Business Administration)',
];

const SEMESTERS = [
  { value: 1, label: '1st Semester (Year 1)' },
  { value: 2, label: '2nd Semester (Year 1)' },
  { value: 3, label: '3rd Semester (Year 2)' },
  { value: 4, label: '4th Semester (Year 2)' },
  { value: 5, label: '5th Semester (Year 3)' },
  { value: 6, label: '6th Semester (Year 3)' },
  { value: 7, label: '7th Semester (Year 4)' },
  { value: 8, label: '8th Semester (Year 4)' },
];

const GRADUATION_YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role')?.toUpperCase();

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [degree, setDegree] = useState('B.Tech');
  const [currentSemester, setCurrentSemester] = useState<number>(6);
  const [expectedGraduationYear, setExpectedGraduationYear] = useState<number>(2026);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI Interactive State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState<StudentRegistrationResponse['data'] | null>(null);

  // Password Strength Evaluation
  const passwordCriteria = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[@$!%*?&#^()_+\-=[\]{}|;:'",.<>/`~]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.minLength) score += 1;
    if (passwordCriteria.hasUpper && passwordCriteria.hasLower) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecial) score += 1;
    return score;
  }, [passwordCriteria]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // Client Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full legal name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors.email = 'Please provide a valid institutional email address.';
    }

    const usnRegex = /^[A-Za-z0-9\-_./]{3,40}$/;
    if (!rollNumber.trim() || !usnRegex.test(rollNumber.trim())) {
      errors.rollNumber = 'USN must be 3-40 alphanumeric characters (symbols -, _, ., / allowed).';
    }

    if (!department) {
      errors.department = 'Academic department is required.';
    }

    if (!degree) {
      errors.degree = 'Degree/program is required.';
    }

    if (passwordScore < 4) {
      errors.password = 'Password must meet all 5 security requirements below.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (phoneNumber.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        errors.phoneNumber = 'Please enter a valid phone number or leave blank.';
      }
    }

    if (!agreeTerms) {
      errors.agreeTerms = 'You must certify that you are an enrolled student at this institution.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.registerStudent({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        rollNumber: rollNumber.trim().toUpperCase(),
        department: department.trim(),
        degree: degree.includes('(') ? degree.split('(')[0].trim() : degree.trim(),
        currentSemester: Number(currentSemester),
        expectedGraduationYear: Number(expectedGraduationYear),
        phoneNumber: phoneNumber.trim() || undefined,
        password,
        confirmPassword,
      });

      setRegistrationSuccess(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please check your details and try again.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // If visitor specifically asked for Alumni registration, show transparent institutional guidance
  if (requestedRole === 'ALUMNI') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm transition-transform group-hover:scale-105">
                <GraduationCap className="h-6 w-6 text-brand-400" />
              </div>
              <span className="font-bold text-navy-950 text-xl tracking-tight">ALUMNI CONNECT</span>
            </Link>
          </div>

          <Card className="shadow-lg border-slate-200 bg-white">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700 mb-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl text-navy-950">Alumni Onboarding by Invitation</CardTitle>
              <CardDescription className="text-slate-600 text-xs mt-1">
                To guarantee zero fake profiles and protect students, graduate accounts require administrative degree verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-600">
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 space-y-2">
                <p className="font-semibold text-navy-950">How Alumni Verification Works:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Direct batch invitations issued via official university convocation archives.</li>
                  <li>Official LinkedIn OpenID Connect credential sync.</li>
                  <li>Human-in-the-loop review by the Alumni Relations Office.</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/register" className="w-full">
                  <Button variant="navy" className="w-full text-xs">
                    Register as Current Student Instead
                  </Button>
                </Link>
                <Link to="/login" className="w-full">
                  <Button variant="outline" className="w-full text-xs border-slate-300">
                    Sign In with Existing Credentials
                  </Button>
                </Link>
                <Link to="/" className="w-full text-center text-xs text-brand-600 hover:underline pt-2">
                  ← Return to Alumni Connect Homepage
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Confirmation View (Rendered after successful registration submission)
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm transition-transform group-hover:scale-105">
                <GraduationCap className="h-6 w-6 text-brand-400" />
              </div>
              <span className="font-bold text-navy-950 text-xl tracking-tight">ALUMNI CONNECT</span>
            </Link>
          </div>

          <Card className="shadow-xl border-slate-200 bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 p-6 text-white text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 mb-3 shadow-inner">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Registration Submitted</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                Your student profile record has been created and submitted to the institutional verification queue.
              </p>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Verification Status Banner */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                  <span className="text-sm font-bold text-amber-900">
                    Account Status: PENDING INSTITUTIONAL VERIFICATION
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  As an official college platform, <strong>Alumni Connect</strong> restricts access to protected networking
                  features (such as 1-on-1 alumni mentorship requests, verified direct messaging, and campus job applications)
                  until your college affiliation and USN are confirmed by the Career Development Centre (CDC) / College Administration.
                </p>
              </div>

              {/* Submitted Student Record Summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Registered Profile Snapshot
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Full Name:</span>
                    <p className="font-semibold text-navy-950">{registrationSuccess.user.fullName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Institutional Email:</span>
                    <p className="font-semibold text-navy-950">{registrationSuccess.user.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Claimed USN / Roll No:</span>
                    <p className="font-semibold text-navy-950 font-mono">{registrationSuccess.profile.rollNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Department & Program:</span>
                    <p className="font-semibold text-navy-950">
                      {registrationSuccess.profile.department} ({registrationSuccess.profile.degree})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Current Semester:</span>
                    <p className="font-semibold text-navy-950">Semester {registrationSuccess.profile.currentSemester}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Expected Graduation:</span>
                    <p className="font-semibold text-navy-950">Class of {registrationSuccess.profile.expectedGraduationYear}</p>
                  </div>
                </div>
              </div>

              {/* Next Steps Guidance */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Next Steps:</strong> An institutional coordinator will review your registration against official college enrollment rosters.
                    Once approved, your account status will transition to <strong>VERIFIED</strong> with full alumni networking access.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Institutional Policy:</strong> You may sign in immediately to inspect your draft profile. Automated email OTP verification has not yet been enabled; all identity verifications are reviewed securely by college administration.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link to="/login" className="flex-1">
                  <Button variant="navy" className="w-full font-semibold shadow-md gap-2">
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/" className="flex-1">
                  <Button variant="outline" className="w-full border-slate-300 text-slate-700">
                    Return to Homepage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Registration Form View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="h-6 w-6 text-brand-400" />
          </div>
          <span className="font-bold text-navy-950 text-xl tracking-tight">ALUMNI CONNECT</span>
        </Link>
        <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Official Institutional Student Registration
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <Card className="shadow-xl border-slate-200/90 bg-white">
          <CardHeader className="space-y-1 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Student Membership</span>
              </span>
              <Link to="/login" className="text-xs font-semibold text-brand-600 hover:underline">
                Already registered? Sign In
              </Link>
            </div>
            <CardTitle className="text-2xl font-extrabold text-navy-950 pt-2">
              Create Your Student Profile
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Complete your institutional enrollment details to access certified alumni mentorship, campus job referrals, and career events upon credential verification.
            </CardDescription>

            {/* Institutional Trust Notice */}
            <div className="mt-3 rounded-lg bg-navy-950 text-white p-3 text-xs flex items-start gap-2.5 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-brand-300">Closed Campus Verification Model</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Student profiles undergo credential review by the College Administration / Career Development Centre (CDC) against registrar rolls. Unverified accounts cannot send mentorship or direct messaging requests.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Server Error Alert */}
            {serverError && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3 text-xs text-red-800">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Registration Error</p>
                  <p>{serverError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5" noValidate>
              {/* Row 1: Full Name & Institutional Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="reg-fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-fullName"
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: '' }));
                      }}
                      className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.fullName
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20'
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.fullName ? (
                    <p className="text-xs text-red-600 font-medium">{fieldErrors.fullName}</p>
                  ) : (
                    <p className="text-[11px] text-slate-500">As recorded in college enrollment registers</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Institutional Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="e.g. alex.rivera@student.edu"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.email
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20'
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.email ? (
                    <p className="text-xs text-red-600 font-medium">{fieldErrors.email}</p>
                  ) : (
                    <p className="text-[11px] text-slate-500">College-issued domain or authorized address</p>
                  )}
                </div>
              </div>

              {/* Row 2: USN & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="reg-usn" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    USN / Student Roll Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-usn"
                      type="text"
                      placeholder="e.g. 1MS21CS042 or CS2023-4089"
                      value={rollNumber}
                      onChange={(e) => {
                        setRollNumber(e.target.value.toUpperCase());
                        if (fieldErrors.rollNumber) setFieldErrors((prev) => ({ ...prev, rollNumber: '' }));
                      }}
                      className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.rollNumber
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20'
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.rollNumber ? (
                    <p className="text-xs text-red-600 font-medium">{fieldErrors.rollNumber}</p>
                  ) : (
                    <p className="text-[11px] text-slate-500">University Serial Number or permanent student ID</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-department" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Academic Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reg-department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                    required
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">Enrolled branch or academic school</p>
                </div>
              </div>

              {/* Row 3: Degree & Current Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="reg-degree" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Degree / Program <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reg-degree"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                    required
                  >
                    {DEGREES.map((deg) => (
                      <option key={deg} value={deg}>
                        {deg}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">Undergraduate or postgraduate program</p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-semester" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Current Semester / Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reg-semester"
                    value={currentSemester}
                    onChange={(e) => setCurrentSemester(Number(e.target.value))}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                    required
                  >
                    {SEMESTERS.map((sem) => (
                      <option key={sem.value} value={sem.value}>
                        {sem.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">Your current enrolled semester</p>
                </div>
              </div>

              {/* Row 4: Expected Graduation Year & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="reg-gradYear" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Expected Graduation Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reg-gradYear"
                    value={expectedGraduationYear}
                    onChange={(e) => setExpectedGraduationYear(Number(e.target.value))}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                    required
                  >
                    {GRADUATION_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        Class of {yr}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">Anticipated year of degree conferral</p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (fieldErrors.phoneNumber) setFieldErrors((prev) => ({ ...prev, phoneNumber: '' }));
                    }}
                    className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.phoneNumber
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20'
                    }`}
                  />
                  {fieldErrors.phoneNumber ? (
                    <p className="text-xs text-red-600 font-medium">{fieldErrors.phoneNumber}</p>
                  ) : (
                    <p className="text-[11px] text-slate-500">For administrative verification contact</p>
                  )}
                </div>
              </div>

              {/* Row 5: Password & Confirm Password */}
              <div className="pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                        }}
                        className={`flex h-10 w-full rounded-lg border bg-white pr-10 pl-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          fieldErrors.password
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Live Password Strength Meter */}
                    {password && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Password Strength:</span>
                          <span
                            className={`font-bold ${
                              passwordScore <= 1
                                ? 'text-red-600'
                                : passwordScore === 2
                                ? 'text-amber-600'
                                : passwordScore === 3
                                ? 'text-blue-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {passwordScore <= 1
                              ? 'Weak'
                              : passwordScore === 2
                              ? 'Fair'
                              : passwordScore === 3
                              ? 'Good'
                              : 'Strong (Meets institutional requirements)'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordScore <= 1
                                ? 'w-1/4 bg-red-500'
                                : passwordScore === 2
                                ? 'w-2/4 bg-amber-500'
                                : passwordScore === 3
                                ? 'w-3/4 bg-blue-500'
                                : 'w-full bg-emerald-500'
                            }`}
                          />
                        </div>

                        {/* Interactive Requirements Checklist */}
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1">
                          <span className={`flex items-center gap-1 ${passwordCriteria.minLength ? 'text-emerald-600 font-semibold' : ''}`}>
                            {passwordCriteria.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-slate-400" />}
                            8+ characters
                          </span>
                          <span className={`flex items-center gap-1 ${passwordCriteria.hasUpper ? 'text-emerald-600 font-semibold' : ''}`}>
                            {passwordCriteria.hasUpper ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-slate-400" />}
                            Uppercase letter
                          </span>
                          <span className={`flex items-center gap-1 ${passwordCriteria.hasLower ? 'text-emerald-600 font-semibold' : ''}`}>
                            {passwordCriteria.hasLower ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-slate-400" />}
                            Lowercase letter
                          </span>
                          <span className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? 'text-emerald-600 font-semibold' : ''}`}>
                            {passwordCriteria.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-slate-400" />}
                            Number (0-9)
                          </span>
                          <span className={`flex items-center gap-1 col-span-2 ${passwordCriteria.hasSpecial ? 'text-emerald-600 font-semibold' : ''}`}>
                            {passwordCriteria.hasSpecial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-slate-400" />}
                            Special symbol (@$!%*?&#)
                          </span>
                        </div>
                      </div>
                    )}
                    {fieldErrors.password && <p className="text-xs text-red-600 font-medium">{fieldErrors.password}</p>}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                        }}
                        className={`flex h-10 w-full rounded-lg border bg-white pr-10 pl-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          fieldErrors.confirmPassword
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {confirmPassword && (
                      <p
                        className={`text-[11px] font-semibold flex items-center gap-1 ${
                          passwordsMatch ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {passwordsMatch ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Passwords match</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Passwords do not match</span>
                          </>
                        )}
                      </p>
                    )}
                    {fieldErrors.confirmPassword && (
                      <p className="text-xs text-red-600 font-medium">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Certification Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (fieldErrors.agreeTerms) setFieldErrors((prev) => ({ ...prev, agreeTerms: '' }));
                    }}
                    className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    required
                  />
                  <span>
                    I certify that I am a currently enrolled student at this institution and that the USN, department, and academic details provided are genuine and subject to verification by College Administration / CDC.
                  </span>
                </label>
                {fieldErrors.agreeTerms && (
                  <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.agreeTerms}</p>
                )}
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="navy"
                isLoading={isLoading}
                className="w-full font-semibold shadow-md py-2.5 text-sm gap-2"
              >
                <span>Submit Student Registration</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 py-4 px-6 text-xs text-slate-500 gap-2 bg-slate-50/50">
            <Link to="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-navy-950 font-medium">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Homepage</span>
            </Link>
            <p>
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:underline">
                Sign in to your account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
