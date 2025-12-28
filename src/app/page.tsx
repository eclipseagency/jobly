'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LocationDropdown } from '@/components/ui/LocationDropdown';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, user, getDashboardPath, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    router.push(`/dashboard/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Navigation */}
      <nav className="border-b border-slate-100 w-full">
        <div className="container-center">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Image src="/logo.svg" alt="Jobly" width={100} height={28} priority />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/dashboard/jobs" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                Find Jobs
              </Link>
              {isLoggedIn && user?.role === 'employer' ? (
                <Link href="/employer/dashboard" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                  Employer Dashboard
                </Link>
              ) : (
                <Link href="/auth/employer/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                  For Employers
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={logout}
                    className="hidden sm:inline-flex text-slate-600 hover:text-slate-900 text-sm font-medium"
                  >
                    Sign out
                  </button>
                  <Link
                    href={getDashboardPath()}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    My Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="hidden sm:inline-flex text-slate-600 hover:text-slate-900 text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - 2 Column */}
      <section className="py-12 md:py-20 w-full">
        <div className="container-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Find your dream job in the Philippines and beyond.
              </h1>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed">
                Connect with top employers, showcase your skills, and take the next step in your career journey.
              </p>

              {/* Search Box */}
              <form onSubmit={handleSearch} className="mt-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full sm:w-auto sm:flex-1">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Job title or keyword"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    />
                  </div>
                  <LocationDropdown
                    value={locationQuery}
                    onChange={setLocationQuery}
                    placeholder="Select location"
                    className="w-full sm:w-auto sm:flex-1"
                  />
                  <button
                    type="submit"
                    className="shrink-0 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors text-center whitespace-nowrap"
                  >
                    Search Jobs
                  </button>
                </div>
              </form>

              {/* Feature Bullets */}
              <div className="mt-6 flex flex-wrap gap-4">
                {[
                  { icon: '✓', text: 'Verified Employers' },
                  { icon: '✓', text: 'Smart Matching' },
                  { icon: '✓', text: 'Free for Seekers' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                      {item.icon}
                    </span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="hidden lg:block">
              <div className="relative w-full h-[420px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/hero-team.jpg"
                  alt="Professional team in BGC, Philippines"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How JOBLY Works */}
      <section className="py-16 md:py-20 bg-slate-50 w-full">
        <div className="container-center">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">How JOBLY Works</h2>
            <p className="mt-3 text-slate-600">Land your dream job in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: 'Search & Filter',
                description: 'Browse thousands of job listings. Filter by location, salary, job type, and experience level to find the perfect match.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Easy Apply',
                description: 'Apply to jobs with one click using your saved profile. Track all your applications in one convenient dashboard.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ),
                title: 'Get Hired',
                description: 'Connect directly with employers, schedule interviews, and receive job offers. Start your new career journey today.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all">
                <div className="w-14 h-14 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Strip - Dark */}
      <section className="py-12 bg-slate-900 w-full">
        <div className="container-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50k+', label: 'Live Jobs' },
              { value: '20k+', label: 'Companies' },
              { value: '100k+', label: 'Candidates' },
              { value: '15+', label: 'Countries' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 w-full">
        <div className="container-center">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to start your career journey?
            </h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">
              Join thousands of professionals who have found their dream jobs through JOBLY.
              Create your free account today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/employee/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Create Free Account
              </Link>
              <Link
                href="/auth/employer/register"
                className="w-full sm:w-auto px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 w-full">
        <div className="container-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <Image src="/logo.svg" alt="Jobly" width={90} height={25} />
              </div>
              <p className="text-sm text-slate-500">
                Connecting talent with opportunity across the Philippines and beyond.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-4 text-sm">For Job Seekers</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/dashboard/jobs" className="hover:text-slate-900">Browse Jobs</Link></li>
                <li><Link href="#" className="hover:text-slate-900">Career Advice</Link></li>
                <li><Link href="#" className="hover:text-slate-900">Resume Tips</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-4 text-sm">For Employers</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/auth/employer/register" className="hover:text-slate-900">Post a Job</Link></li>
                <li><Link href="#" className="hover:text-slate-900">Pricing</Link></li>
                <li><Link href="#" className="hover:text-slate-900">Resources</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-slate-900">About</Link></li>
                <li><Link href="#" className="hover:text-slate-900">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-slate-900">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Jobly. All rights reserved.
            </p>
            <p className="text-sm text-slate-500">
              Made in the Philippines
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-50">
        <div className="flex items-center justify-around py-2">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500 hover:text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </Link>
          <Link
            href="/dashboard/jobs"
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500 hover:text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">Jobs</span>
          </Link>
          <Link
            href={isLoggedIn ? getDashboardPath() : '/auth'}
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500 hover:text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">{isLoggedIn ? 'Dashboard' : 'Account'}</span>
          </Link>
        </div>
      </div>
      <div className="h-16 md:hidden" />
    </div>
  );
}
