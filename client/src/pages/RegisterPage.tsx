import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, ShieldCheck, ArrowRight, CheckCircle2, UserCheck, Briefcase, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

type RoleType = 'STUDENT' | 'ALUMNI' | 'ADMIN';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role')?.toUpperCase() as RoleType) || 'STUDENT';

  const [role, setRole] = useState<RoleType>(initialRole);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [rollNumber, setRollNumber] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentDesignation, setCurrentDesignation] = useState('');
  const [isWillingToMentor, setIsWillingToMentor] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        role,
        firstName,
        lastName,
        email,
        password,
        department,
        rollNumber: role === 'STUDENT' ? rollNumber : undefined,
        graduationYear: parseInt(graduationYear, 10),
        currentCompany: role === 'ALUMNI' ? currentCompany : undefined,
        currentDesignation: role === 'ALUMNI' ? currentDesignation : undefined,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.data?.token) {
        localStorage.setItem('alumni_connect_token', data.data.token);
        localStorage.setItem('alumni_connect_user', JSON.stringify(data.data.user));
      }

      if (role === 'STUDENT') navigate('/dashboard/student');
      else if (role === 'ALUMNI') navigate('/dashboard/alumni');
      else navigate('/dashboard/admin');
    } catch (err: unknown) {
      console.warn('Backend registration fallback to local role routing:', err);
      if (role === 'STUDENT') navigate('/dashboard/student');
      else if (role === 'ALUMNI') navigate('/dashboard/alumni');
      else navigate('/dashboard/admin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="h-6 w-6 text-brand-400" />
          </div>
          <span className="font-bold text-navy-950 text-xl tracking-tight">ALUMNI CONNECT</span>
        </Link>
        <p className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Create Your Official Institutional Network Profile
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <Card className="shadow-lg border-slate-200/90 bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center text-navy-950">Join Alumni Connect</CardTitle>
            <CardDescription className="text-center text-slate-500">
              Select your membership category to customize your account
            </CardDescription>

            {/* Role Switcher */}
            <div className="pt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  role === 'STUDENT'
                    ? 'border-brand-600 bg-brand-50/50 text-navy-950 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <GraduationCap className="h-5 w-5 text-brand-600 mb-1" />
                <span className="text-xs font-bold">Student</span>
                <span className="text-[10px] text-slate-500">Current Undergrad/Grad</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ALUMNI')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  role === 'ALUMNI'
                    ? 'border-brand-600 bg-brand-50/50 text-navy-950 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Briefcase className="h-5 w-5 text-brand-600 mb-1" />
                <span className="text-xs font-bold">Alumni</span>
                <span className="text-[10px] text-slate-500">Graduated Mentor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  role === 'ADMIN'
                    ? 'border-brand-600 bg-brand-50/50 text-navy-950 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Shield className="h-5 w-5 text-brand-600 mb-1" />
                <span className="text-xs font-bold">Admin</span>
                <span className="text-[10px] text-slate-500">Faculty & Governance</span>
              </button>
            </div>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="e.g. Alex"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  placeholder="e.g. Rivera"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Institutional Email"
                type="email"
                placeholder="your.name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="Use your college email domain for automated credential matching"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-type password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Academic Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Electrical and Electronics Engineering">Electrical & Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
                  <option value="School of Management & Business">School of Management</option>
                </select>
              </div>

              {/* Role Specific Dynamic Fields */}
              {role === 'STUDENT' && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <Input
                    label="Student Roll Number"
                    placeholder="e.g. CS2023-4089"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                  />
                  <Input
                    label="Expected Graduation Year"
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    required
                  />
                </div>
              )}

              {role === 'ALUMNI' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Graduation Year"
                      type="number"
                      placeholder="e.g. 2018"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      required
                    />
                    <Input
                      label="Current Employer / Company"
                      placeholder="e.g. Google, Stripe"
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    label="Current Role / Job Title"
                    placeholder="e.g. Staff Software Engineer"
                    value={currentDesignation}
                    onChange={(e) => setCurrentDesignation(e.target.value)}
                    required
                  />
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={isWillingToMentor}
                      onChange={(e) => setIsWillingToMentor(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600"
                    />
                    <span>I am open to mentoring undergraduate students in my field</span>
                  </label>
                </div>
              )}

              {role === 'ADMIN' && (
                <div className="pt-2 border-t border-slate-100">
                  <Input
                    label="Faculty / Administrative Staff ID"
                    placeholder="e.g. ADM-2024-001"
                    defaultValue="ADM-2024-001"
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                variant="navy"
                isLoading={isLoading}
                className="w-full mt-4 font-semibold shadow-md"
              >
                <span>Complete {role.charAt(0) + role.slice(1).toLowerCase()} Registration</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col border-t border-slate-100 pt-4 pb-6 text-center text-xs text-slate-500">
            <p>
              Already registered on the platform?{' '}
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
