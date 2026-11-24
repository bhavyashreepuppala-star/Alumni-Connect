import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Building2,
  Briefcase,
  Globe,
  MapPin,
  Linkedin,
  Sparkles,
  Phone,
  BookOpen,
  Calendar,
  Clock,
  ArrowLeft,
  Check,
  Star,
  Users,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { api, AlumniRegistrationResponse } from '../lib/api';

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
  'Ph.D. / Doctoral Studies',
];

const INDUSTRIES = [
  'Software & Cloud Computing',
  'Artificial Intelligence & Data Science',
  'Financial Services & Fintech',
  'Semiconductors & Embedded Systems',
  'Consulting & Professional Services',
  'Healthcare & Biotechnology',
  'Automotive & Aerospace',
  'E-commerce & Retail Tech',
  'Education & EdTech',
  'Manufacturing & Energy',
];

const CURRENT_YEAR = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 45 }, (_, i) => CURRENT_YEAR - i);

export const AlumniRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Personal Information
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // College Details
  const [rollNumber, setRollNumber] = useState('');
  const [collegeName, setCollegeName] = useState('Alumni Connect University');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [degree, setDegree] = useState('B.Tech');
  const [graduationYear, setGraduationYear] = useState<number>(CURRENT_YEAR - 2);

  // Professional Details
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentDesignation, setCurrentDesignation] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(3);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [skillsText, setSkillsText] = useState('');

  // Additional Information
  const [bio, setBio] = useState('');
  const [mentorshipTopics, setMentorshipTopics] = useState('');
  const [isWillingToMentor, setIsWillingToMentor] = useState(true);
  const [maxMentees, setMaxMentees] = useState<number>(2);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI Interactive State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState<AlumniRegistrationResponse['data'] | null>(null);

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
      errors.email = 'Please provide a valid email address.';
    }

    const usnRegex = /^[A-Za-z0-9\-_./]{3,40}$/;
    if (!rollNumber.trim() || !usnRegex.test(rollNumber.trim())) {
      errors.rollNumber = 'USN / Registration number must be 3-40 alphanumeric characters.';
    }

    if (!department) {
      errors.department = 'Department is required.';
    }

    if (!degree) {
      errors.degree = 'Degree/program is required.';
    }

    if (!graduationYear || graduationYear > CURRENT_YEAR) {
      errors.graduationYear = 'Graduation year cannot be in the future.';
    }

    if (passwordScore < 4) {
      errors.password = 'Password must meet all complexity requirements.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      errors.agreeTerms = 'You must affirm your institutional affiliation and agree to terms.';
    }

    if (linkedinUrl && !/^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(linkedinUrl.trim()) && !/^[a-zA-Z0-9_-]+$/.test(linkedinUrl.trim())) {
      errors.linkedinUrl = 'Please provide a valid LinkedIn profile URL.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      const firstErrorKey = Object.keys(fieldErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsLoading(true);

    try {
      const skillsArray = skillsText
        ? skillsText.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const res = await api.registerAlumni({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim() || undefined,
        password,
        confirmPassword,
        rollNumber: rollNumber.trim().toUpperCase(),
        collegeName: collegeName.trim() || 'Alumni Connect University',
        department,
        degree,
        graduationYear,
        currentCompany: currentCompany.trim() || undefined,
        currentDesignation: currentDesignation.trim() || undefined,
        industry: industry || undefined,
        yearsOfExperience: Number(yearsOfExperience) || 0,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        skills: skillsArray,
        bio: bio.trim() || undefined,
        mentorshipTopics: mentorshipTopics.trim() || undefined,
        isWillingToMentor,
        maxMentees: Number(maxMentees) || 2,
      });

      setRegistrationSuccess(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please check your details and try again.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmation View
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
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm mb-3">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Alumni Registration Received</h2>
              <p className="text-emerald-100 text-xs mt-1">
                Your graduate profile is safely queued for administrative verification.
              </p>
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3 text-xs text-amber-900">
                <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Next Step: Degree Archive Verification</p>
                  <p className="mt-1 leading-relaxed text-amber-800">
                    To protect our student community and ensure authenticity, the Alumni Relations Office will review your
                    degree credentials against the university convocation registry.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
                <p className="font-bold text-navy-950 uppercase tracking-wider text-[11px]">Submitted Credential Snapshot</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Full Name</span>
                    <span className="font-semibold text-navy-950">{registrationSuccess.user.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <span className="font-semibold text-navy-950 truncate block">{registrationSuccess.user.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">USN / Reg ID</span>
                    <span className="font-mono font-semibold text-navy-950">{registrationSuccess.profile.rollNumber || 'On Record'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Graduation</span>
                    <span className="font-semibold text-navy-950">Class of {registrationSuccess.profile.graduationYear}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Department</span>
                    <span className="font-semibold text-navy-950">{registrationSuccess.profile.department}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Link to="/login" className="block w-full">
                  <Button variant="navy" className="w-full font-semibold shadow-md gap-2">
                    <span>Sign In to Institutional Status Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/" className="block text-center text-xs text-slate-500 hover:text-slate-800 underline">
                  Return to Campus Homepage
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 group mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="h-6 w-6 text-brand-400" />
          </div>
          <span className="font-bold text-navy-950 text-xl tracking-tight">ALUMNI CONNECT</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          Alumni Community Onboarding
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Reunite with your alma mater, give back through 1-on-1 student mentorship, and expand your professional graduate network.
        </p>

        {/* Tab switch between Student and Alumni */}
        <div className="mt-4 inline-flex items-center rounded-lg bg-slate-200/70 p-1 border border-slate-300">
          <Link
            to="/register"
            className="rounded-md px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all"
          >
            Current Student
          </Link>
          <span className="rounded-md bg-white px-3.5 py-1.5 text-xs font-bold text-navy-950 shadow-sm">
            Graduated Alumni
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-navy-950">Graduate Registration Form</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Please provide your academic records and current professional background
                </CardDescription>
              </div>
              <Badge variant="blue" className="text-xs">
                Class of 1950 - {CURRENT_YEAR}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {serverError && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 text-xs text-red-800 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Registration Alert</p>
                  <p className="mt-0.5">{serverError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* SECTION 1: Personal Information */}
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <User className="h-4 w-4 text-brand-600" />
                  <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                    1. Personal & Account Credentials
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="sm:col-span-2">
                    <Input
                      id="fullName"
                      label="Full Legal Name"
                      placeholder="e.g. Sarah Chen"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      error={fieldErrors.fullName}
                      required
                    />
                  </div>

                  <Input
                    id="email"
                    label="Primary Email Address"
                    type="email"
                    placeholder="name@alumni.edu or personal email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={fieldErrors.email}
                    helperText="Official notices and mentee inquiries will be sent here."
                    required
                  />

                  <Input
                    id="phoneNumber"
                    label="Phone Number (Optional)"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Input
                        id="password"
                        label="Account Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={fieldErrors.password}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={fieldErrors.confirmPassword}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password strength checklist */}
                {password && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span>Password Security Strength:</span>
                      <span className={passwordScore >= 4 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                        {passwordScore >= 4 ? 'Strong (Approved)' : `${passwordScore}/4 Criteria Met`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1">
                      <span className={passwordCriteria.minLength ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                        {passwordCriteria.minLength ? '✓' : '•'} 8+ characters
                      </span>
                      <span className={passwordCriteria.hasUpper ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                        {passwordCriteria.hasUpper ? '✓' : '•'} 1+ Uppercase letter
                      </span>
                      <span className={passwordCriteria.hasLower ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                        {passwordCriteria.hasLower ? '✓' : '•'} 1+ Lowercase letter
                      </span>
                      <span className={passwordCriteria.hasNumber ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                        {passwordCriteria.hasNumber ? '✓' : '•'} 1+ Number
                      </span>
                      <span className={passwordCriteria.hasSpecial ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                        {passwordCriteria.hasSpecial ? '✓' : '•'} 1+ Special character
                      </span>
                      {confirmPassword && (
                        <span className={passwordsMatch ? 'text-emerald-600 font-medium' : 'text-red-500'}>
                          {passwordsMatch ? '✓ Passwords match' : '✕ Passwords mismatch'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: College & Academic Records */}
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <GraduationCap className="h-4 w-4 text-brand-600" />
                  <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                    2. Alma Mater & Academic Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Input
                    id="rollNumber"
                    label="USN / University Registration Number"
                    placeholder="e.g. CS2018-094"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    error={fieldErrors.rollNumber}
                    helperText="Used by registrar to match degree archives."
                    required
                  />

                  <Input
                    id="collegeName"
                    label="College / Institution Name"
                    placeholder="Alumni Connect University"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Academic Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Graduation Year</label>
                    <select
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(Number(e.target.value))}
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      {GRADUATION_YEARS.map((y) => (
                        <option key={y} value={y}>
                          Class of {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Degree / Program Awarded</label>
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      {DEGREES.map((deg) => (
                        <option key={deg} value={deg}>
                          {deg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Professional Experience */}
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Briefcase className="h-4 w-4 text-brand-600" />
                  <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                    3. Professional Experience & Industry Focus
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Current Employer / Company"
                    placeholder="e.g. Google, Microsoft, Stripe"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                  />

                  <Input
                    label="Current Job Title / Designation"
                    placeholder="e.g. Staff Software Engineer"
                    value={currentDesignation}
                    onChange={(e) => setCurrentDesignation(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Industry Domain</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Total Years of Experience"
                    type="number"
                    min={0}
                    max={60}
                    placeholder="e.g. 5"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                  />

                  <Input
                    label="Current City"
                    placeholder="e.g. Bengaluru / San Francisco"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />

                  <Input
                    label="Country"
                    placeholder="e.g. India / United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />

                  <div className="sm:col-span-2">
                    <Input
                      label="LinkedIn Profile URL"
                      placeholder="https://linkedin.com/in/yourhandle"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      error={fieldErrors.linkedinUrl}
                      helperText="Helps students verify your background and experience."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Key Skills & Tech Stack (Comma separated)"
                      placeholder="e.g. Distributed Systems, Kubernetes, TypeScript, Go, System Design"
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      helperText="Skills will be indexed to match you with student mentorship requests."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Mentorship & Bio */}
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Sparkles className="h-4 w-4 text-brand-600" />
                  <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                    4. Mentorship & Bio
                  </h3>
                </div>

                <div className="space-y-4 mt-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Short Professional Bio</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe your career journey, achievements, and what motivates you to stay connected with students..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  {/* Mentorship Preference Toggle */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-brand-600" />
                        <div>
                          <p className="text-sm font-bold text-navy-950">Student Mentorship Availability</p>
                          <p className="text-xs text-slate-500">Allow verified students from your department to request 1-on-1 career guidance calls.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isWillingToMentor}
                          onChange={(e) => setIsWillingToMentor(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                      </label>
                    </div>

                    {isWillingToMentor && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                        <Input
                          label="Topics Open to Guide"
                          placeholder="e.g. Mock Interviews, Resume Reviews, Big Tech Transitions"
                          value={mentorshipTopics}
                          onChange={(e) => setMentorshipTopics(e.target.value)}
                        />
                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-slate-700">Concurrent Mentee Capacity</label>
                          <select
                            value={maxMentees}
                            onChange={(e) => setMaxMentees(Number(e.target.value))}
                            className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                          >
                            <option value={1}>1 Student (Recommended for busy schedules)</option>
                            <option value={2}>2 Students (Standard capacity)</option>
                            <option value={3}>3 Students</option>
                            <option value={5}>5 Students (Active mentor)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms & Conditions Affirmation */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        required
                      />
                      <span>
                        I affirm that all academic records and professional credentials submitted are true and authentic.
                        I understand that my account requires institutional verification by the Alumni Relations Office before
                        networking features are unlocked.
                      </span>
                    </label>
                    {fieldErrors.agreeTerms && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.agreeTerms}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800">
                  Already registered? <span className="text-brand-600 font-semibold underline">Sign In</span>
                </Link>
                <Button
                  type="submit"
                  variant="navy"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full sm:w-auto font-bold shadow-md px-8"
                >
                  <span>Submit Alumni Registration</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span>Strict institutional degree verification policy · Zero fake profiles guaranteed</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
