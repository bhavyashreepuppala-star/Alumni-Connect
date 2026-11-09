import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-navy-950 p-8 sm:p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          <div className="relative max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-4 py-1.5 text-xs font-semibold text-brand-300">
              <ShieldCheck className="h-4 w-4 text-brand-400" />
              <span>Join Your Alma Mater Community Today</span>
            </div>

            <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">
              Ready to Accelerate Your Career or Mentor the Next Generation?
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Whether you are an aspiring college student seeking your dream internship, an experienced alumnus offering mentorship, or a faculty administrator tracking graduate success, Alumni Connect is built for you.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 font-semibold gap-2 shadow-lg shadow-brand-500/20">
                  <span>Create Your Free Account</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-900/60 text-white hover:bg-slate-800">
                  Existing Member Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
