'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-employee-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-employer-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/25">
            J
          </div>
          <span className="text-2xl font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
            Jobly
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl animate-fade-in">
          {/* Welcome text */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary-600 to-employer-500 bg-clip-text text-transparent">
                Jobly
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Where talent meets opportunity. Choose your path below to get started on your journey.
            </p>
          </div>

          {/* Role selection cards */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Job Seeker Card */}
            <Link href="/auth/employee/login" className="group">
              <Card
                variant="elevated"
                hover
                className="h-full border-2 border-transparent hover:border-employee-300 cursor-pointer"
              >
                <div className="flex flex-col items-center text-center p-4">
                  {/* Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-employee-400 to-employee-600 flex items-center justify-center mb-6 shadow-lg shadow-employee-500/25 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>

                  {/* Content */}
                  <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-employee-600 transition-colors">
                    I&apos;m Looking for Work
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Discover your dream job, connect with top employers, and take the next step in your career journey.
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
                        <svg className="w-5 h-5 text-employee-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="w-full py-3 rounded-xl bg-gradient-to-r from-employee-500 to-employee-600 text-white font-semibold shadow-lg shadow-employee-500/25 group-hover:shadow-xl group-hover:shadow-employee-500/30 transition-all">
                    Start Job Hunting
                  </div>
                </div>
              </Card>
            </Link>

            {/* Employer Card */}
            <Link href="/auth/employer/login" className="group">
              <Card
                variant="elevated"
                hover
                className="h-full border-2 border-transparent hover:border-employer-300 cursor-pointer"
              >
                <div className="flex flex-col items-center text-center p-4">
                  {/* Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-employer-400 to-employer-600 flex items-center justify-center mb-6 shadow-lg shadow-employer-500/25 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>

                  {/* Content */}
                  <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-employer-600 transition-colors">
                    I&apos;m Hiring Talent
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Find exceptional candidates, streamline your hiring process, and build your dream team efficiently.
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
                        <svg className="w-5 h-5 text-employer-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="w-full py-3 rounded-xl bg-gradient-to-r from-employer-500 to-employer-600 text-white font-semibold shadow-lg shadow-employer-500/25 group-hover:shadow-xl group-hover:shadow-employer-500/30 transition-all">
                    Start Hiring Today
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Bottom text */}
          <p className="text-center text-slate-500 mt-8">
            Already have an account? Just select your role above to sign in.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Jobly. Connecting talent with opportunity.</p>
      </footer>
    </div>
  );
}
