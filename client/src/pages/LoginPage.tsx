import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { api } from '../lib/api';

type RoleType = 'STUDENT' | 'ALUMNI' | 'ADMIN';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<RoleType>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const demoCredentials = {
    STUDENT: { email: 'alex.rivera@student.edu', password: 'Password123!' },
    ALUMNI: { email: 'sarah.chen@alumni.edu', password: 'Password123!' },
    ADMIN: { email: 'admin@alumniconnect.edu', password: 'Password123!' },
  };

  const handleFillDemo = (targetRole: RoleType) => {
    setRole(targetRole);
    setEmail(demoCredentials[targetRole].email);
    setPassword(demoCredentials[targetRole].password);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your institutional email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate against real backend database
      const response = await api.login(trimmedEmail, password);

      const authenticatedUser = response.data?.user;
      if (!authenticatedUser) {
        throw new Error('Malformed response from authentication server.');
      }

      // Route strictly based on authenticated database role & account status
      const userRole = authenticatedUser.role;
      const accountStatus = authenticatedUser.status;

      if (userRole === 'STUDENT') {
        if (accountStatus === 'VERIFIED') {
          navigate('/dashboard/student');
        } else {
          // PENDING_VERIFICATION, REJECTED, SUSPENDED accounts go to dedicated status portal
          navigate('/account-status');
        }
      } else if (userRole === 'ALUMNI') {
        if (accountStatus === 'VERIFIED') {
          navigate('/dashboard/alumni');
        } else {
          // Unverified alumni go to status portal
          navigate('/account-status');
        }
      } else if (userRole === 'ADMIN') {
        navigate('/dashboard/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(
        err.message || 'Invalid institutional email or password. Please verify your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Brand Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="h-6 w-6 text-brand-400" />
          </div>
          <span className="font-bold text-navy-950 text-xl tracking-tight">ALUMNI CONNECT</span>
        </Link>
        <p className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Official Institutional Authentication Portal
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg border-slate-200/90 bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center text-navy-950">Welcome Back</CardTitle>
            <CardDescription className="text-center text-slate-500">
              Sign in with your verified institutional credentials
            </CardDescription>

            {/* Role Switcher Tabs */}
            <div className="pt-4">
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200">
                {(['STUDENT', 'ALUMNI', 'ADMIN'] as RoleType[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleFillDemo(r)}
                    className={`rounded-md py-1.5 text-xs font-semibold transition-all ${
                      role === r
                        ? 'bg-white text-navy-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'STUDENT' ? 'Student' : r === 'ALUMNI' ? 'Alumni' : 'Admin'}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Quick Demo Preload Pill */}
            <div className="mb-5 rounded-lg border border-brand-200 bg-brand-50/70 p-3 text-xs text-brand-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-600 shrink-0" />
                <span>
                  Demo Account: <strong>{role.toLowerCase()}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleFillDemo(role)}
                className="font-bold text-brand-600 hover:text-brand-800 underline"
              >
                Auto-fill
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Institutional Email Address"
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <span className="text-xs text-slate-400">
                    Contact admin if forgotten
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600" />
                  <span>Remember this device</span>
                </label>
                <span className="text-slate-400">Institutional SSO ready</span>
              </div>

              <Button
                type="submit"
                variant="navy"
                isLoading={isLoading}
                className="w-full mt-2 font-semibold shadow-md"
              >
                <span>Sign In as {role.charAt(0) + role.slice(1).toLowerCase()}</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            {/* LinkedIn 1-Click Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <a
              href="/api/linkedin/auth-url"
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs gap-2"
              >
                <svg className="h-4 w-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span>LinkedIn 1-Click (Official OpenID Connect)</span>
              </Button>
            </a>
          </CardContent>

          <CardFooter className="flex flex-col border-t border-slate-100 pt-4 pb-6 text-center text-xs text-slate-500">
            <p>
              New to Alumni Connect?{' '}
              <Link to="/register?role=STUDENT" className="font-semibold text-brand-600 hover:underline">
                Register as Student
              </Link>
            </p>
            <p className="mt-2 text-slate-400">
              <Link to="/" className="hover:text-slate-600 underline">
                Return to Campus Homepage
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Security Notice */}
        <p className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <span>Encrypted with institutional credential protection</span>
        </p>
      </div>
    </div>
  );
};
