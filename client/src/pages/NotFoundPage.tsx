import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-white mb-6 shadow-md">
        <GraduationCap className="h-10 w-10 text-brand-400" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 mb-3">
        Error 404
      </span>

      <h1 className="text-3xl font-extrabold text-navy-950 sm:text-4xl tracking-tight mb-2">
        Page Not Found
      </h1>

      <p className="text-sm text-slate-600 max-w-md mb-8">
        The requested page or directory path does not exist in the Alumni Connect institutional platform.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="navy" className="gap-2">
            <Home className="h-4 w-4" />
            <span>Return to Landing Page</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
