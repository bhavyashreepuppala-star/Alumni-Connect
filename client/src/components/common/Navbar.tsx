import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Activity, Menu, X, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Live health query
  const { data: health, isSuccess } = useQuery({
    queryKey: ['system-health'],
    queryFn: api.getHealth,
    refetchInterval: 30000,
    retry: false,
  });

  const isDbUp = health?.services?.database?.status === 'up';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="h-6 w-6 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-navy-950 text-lg">ALUMNI CONNECT</span>
              <ShieldCheck className="h-4 w-4 text-brand-600" />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Institutional Network
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/#pillars"
            className="text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors"
          >
            The Three Pillars
          </Link>
          <Link
            to="/#pathways"
            className="text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors"
          >
            Role Pathways
          </Link>
          <Link
            to="/#spotlight"
            className="text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors"
          >
            Alumni Spotlight
          </Link>
          <Link
            to="/#linkedin-sync"
            className="text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors"
          >
            LinkedIn OIDC
          </Link>
        </nav>

        {/* Right Actions: System Health Badge & Auth CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Health Indicator */}
          <div
            title={`Backend: ${health?.services?.backend?.status ?? 'Connecting'} | MySQL: ${
              health?.services?.database?.status ?? 'Checking'
            }`}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isSuccess && isDbUp
                  ? 'bg-emerald-500 ring-4 ring-emerald-100'
                  : isSuccess
                  ? 'bg-amber-500 ring-4 ring-amber-100'
                  : 'bg-slate-300'
              }`}
            />
            <span className="font-medium text-[11px]">
              {isSuccess && isDbUp ? 'MySQL 8 Connected' : isSuccess ? 'Degraded (No DB)' : 'API Check'}
            </span>
          </div>

          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>

          <Link to="/register">
            <Button variant="navy" size="sm" className="gap-1.5 shadow-sm">
              <span>Join Network</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Link to="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/#pillars"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            The Three Pillars
          </Link>
          <Link
            to="/#pathways"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            Role Pathways
          </Link>
          <Link
            to="/#spotlight"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            Alumni Spotlight
          </Link>
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="navy" className="w-full">
                Join Network
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
