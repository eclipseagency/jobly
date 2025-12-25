'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/">
          <Image src="/logo.svg" alt="Jobly" width={100} height={28} />
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {/* Welcome text */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Welcome to Jobly
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Where talent meets opportunity. Choose your path below to get started.
            </p>
          </div>

          {/* Role selection cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Job Seeker Card */}
            <Link href="/auth/employee/login" className="group">
              <div className="h-full bg-white rounded-xl border border-slate-200 p-8 hover:border-primary-300 hover:shadow-lg transition-all">
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">
                    <svg className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>

                  {/* Content */}
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    I&apos;m Looking for Work
                  </h2>
                  <p className="text-slate-600 text-sm mb-6">
                    Discover your dream job and connect with top employers.
                  </p>

                  {/* Features */}
                  <ul className="text-left space-y-2 mb-6 w-full">
                    {[
                      'Browse thousands of job listings',
                      'One-click applications',
                      'Track your application status',
                      'Get matched with perfect roles',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="w-full py-3 rounded-lg bg-primary-600 text-white font-medium text-center group-hover:bg-primary-700 transition-colors">
                    Start Job Hunting
                  </div>
                </div>
              </div>
            </Link>

            {/* Employer Card */}
            <Link href="/auth/employer/login" className="group">
              <div className="h-full bg-white rounded-xl border border-slate-200 p-8 hover:border-slate-300 hover:shadow-lg transition-all">
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-slate-800 transition-colors">
                    <svg className="w-8 h-8 text-slate-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>

                  {/* Content */}
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    I&apos;m Hiring Talent
                  </h2>
                  <p className="text-slate-600 text-sm mb-6">
                    Find exceptional candidates and build your dream team.
                  </p>

                  {/* Features */}
                  <ul className="text-left space-y-2 mb-6 w-full">
                    {[
                      'Post unlimited job listings',
                      'Smart candidate matching',
                      'Applicant tracking system',
                      'Analytics & hiring insights',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="w-full py-3 rounded-lg bg-slate-800 text-white font-medium text-center group-hover:bg-slate-900 transition-colors">
                    Start Hiring Today
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Bottom text */}
          <p className="text-center text-slate-500 text-sm mt-8">
            Already have an account? Just select your role above to sign in.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Jobly. Connecting talent with opportunity.</p>
      </footer>
    </div>
  );
}
