import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Heart, Database, Server, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Overview */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-white">
                <GraduationCap className="h-5 w-5 text-brand-400" />
              </div>
              <span className="font-bold text-navy-950 text-base tracking-tight">ALUMNI CONNECT</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Bridging current students, distinguished alumni, and university leadership through verified mentorship, internships, and institutional legacy.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Database className="h-3.5 w-3.5 text-brand-600" />
              <span>MySQL 8 • Prisma ORM</span>
            </div>
          </div>

          {/* Column 2: Platform Roles */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-950 mb-3">
              Role Portals
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard/student" className="hover:text-brand-600 transition-colors">
                  Student Career Portal
                </Link>
              </li>
              <li>
                <Link to="/dashboard/alumni" className="hover:text-brand-600 transition-colors">
                  Alumni Mentorship Hub
                </Link>
              </li>
              <li>
                <Link to="/dashboard/admin" className="hover:text-brand-600 transition-colors">
                  Administration Verification Desk
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-600 transition-colors">
                  Institutional Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Features & Integration */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-950 mb-3">
              Features & Standards
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-slate-500">1-on-1 Mentorship Matching</span>
              </li>
              <li>
                <span className="text-slate-500">Official LinkedIn OpenID Connect</span>
              </li>
              <li>
                <span className="text-slate-500">Verified Alumni Credentials</span>
              </li>
              <li>
                <span className="text-slate-500">Direct Campus Hiring Pipeline</span>
              </li>
            </ul>
          </div>

          {/* Column 4: System Telemetry & Trust */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-navy-950 mb-3">
              System & Security
            </h4>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Architecture</span>
                <span className="font-semibold text-slate-900">TypeScript Monorepo</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Database</span>
                <span className="font-semibold text-slate-900">MySQL 8 InnoDB</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Auth Protocol</span>
                <span className="font-semibold text-slate-900">JWT + OAuth 2.0 OIDC</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Security</span>
                <span className="font-semibold text-emerald-600">Strict Validation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Alumni Connect Platform. All rights reserved. University Accredited System.</p>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-slate-600">Sign In</Link>
            <Link to="/register" className="hover:text-slate-600">Join Network</Link>
            <a href="/api/health" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-slate-600">
              <span>API Diagnostics</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
