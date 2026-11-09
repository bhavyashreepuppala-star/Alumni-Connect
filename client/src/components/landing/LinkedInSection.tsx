import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, Share2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const LinkedInSection: React.FC = () => {
  return (
    <section id="linkedin-sync" className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Description */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <span>Compliant OAuth 2.0 & OpenID Connect Architecture</span>
              </div>

              <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight leading-tight">
                Seamless Alumni Verification with Official LinkedIn Integration
              </h2>

              <p className="text-slate-300 text-base leading-relaxed">
                We respect member privacy and platform standards. Our integration uses LinkedIn’s official OpenID Connect protocol. We never scrape, never store unauthorized data, and never harvest credentials.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">1-Click Identity Sync</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      OpenID Connect token exchange verifies email and current public role without manual typing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5">
                  <Share2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Authorized Social Sharing</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Compliant <code className="text-blue-300 font-mono">w_member_social</code> scope lets alumni broadcast campus referrals to their LinkedIn feed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="/api/linkedin/auth-url"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block"
                >
                  <Button className="bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold gap-2 shadow-md">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    <span>Inspect OAuth URL Architecture</span>
                  </Button>
                </a>
                <span className="text-xs text-slate-400">
                  Standard scopes: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">openid profile email w_member_social</code>
                </span>
              </div>
            </div>

            {/* Right Column: Visual Architecture Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <span className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">OAuth2 / OIDC Exchange Spec</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-black/40 p-3 rounded-lg border border-slate-800">
                    <p className="text-slate-400 text-[10px]">AUTH ENDPOINT</p>
                    <p className="text-blue-400 truncate mt-0.5">https://www.linkedin.com/oauth/v2/authorization</p>
                  </div>

                  <div className="bg-black/40 p-3 rounded-lg border border-slate-800">
                    <p className="text-slate-400 text-[10px]">USERINFO ENDPOINT</p>
                    <p className="text-emerald-400 truncate mt-0.5">https://api.linkedin.com/v2/userinfo</p>
                  </div>

                  <div className="bg-black/40 p-3 rounded-lg border border-slate-800 space-y-1">
                    <p className="text-slate-400 text-[10px]">VERIFIED CLAIMS RETURNED</p>
                    <p className="text-slate-200">{`{ "sub": "urn:li:person:...",`}</p>
                    <p className="text-slate-200">{`  "name": "Sarah Chen",`}</p>
                    <p className="text-slate-200">{`  "email_verified": true }`}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>State CSRF token protected • Zero scraping required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
