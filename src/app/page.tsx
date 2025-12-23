import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                J
              </div>
              <span className="text-xl font-semibold text-slate-900">Jobly</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/dashboard/jobs" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                Find Jobs
              </Link>
              <Link href="/auth/employer/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                For Employers
              </Link>
            </div>

            <div className="flex items-center gap-3">
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
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
              Find your next job in the Philippines
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
              Connect with top employers and discover opportunities that match your skills.
              Join thousands of professionals building their careers.
            </p>

            {/* Search Box */}
            <div className="mt-10 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Job title or keyword"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
                  Search
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">50k+</span>
                <span>Active Jobs</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">20k+</span>
                <span>Companies</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">100k+</span>
                <span>Job Seekers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
            <p className="mt-3 text-slate-600">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create your profile',
                description: 'Sign up and build your professional profile. Add your experience, skills, and upload your resume.',
              },
              {
                step: '02',
                title: 'Search and apply',
                description: 'Browse thousands of jobs. Filter by location, salary, and job type to find your perfect match.',
              },
              {
                step: '03',
                title: 'Get hired',
                description: 'Connect with employers, schedule interviews, and land your dream job.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-semibold text-sm mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Job Seekers & Employers */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Job Seekers */}
            <div className="p-8 border border-slate-200 rounded-xl hover:border-primary-200 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">For Job Seekers</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Create your profile, upload your resume, and start applying to jobs.
                Track your applications and get notified when employers respond.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Free to use
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  One-click applications
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Job alerts
                </li>
              </ul>
              <Link
                href="/auth/employee/register"
                className="inline-flex items-center text-primary-600 font-medium text-sm hover:text-primary-700"
              >
                Create account
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Employers */}
            <div className="p-8 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">For Employers</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Post jobs and reach qualified candidates. Manage applications,
                schedule interviews, and hire the right people for your team.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Post unlimited jobs
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Applicant tracking
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Team collaboration
                </li>
              </ul>
              <Link
                href="/auth/employer/register"
                className="inline-flex items-center text-slate-700 font-medium text-sm hover:text-primary-600"
              >
                Post a job
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to find your next opportunity?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join thousands of professionals who have found their dream jobs through Jobly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/employee/register"
              className="w-full sm:w-auto px-6 py-3 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Create account
            </Link>
            <Link
              href="/dashboard/jobs"
              className="w-full sm:w-auto px-6 py-3 border border-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Browse jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                  J
                </div>
                <span className="text-lg font-semibold text-slate-900">Jobly</span>
              </div>
              <p className="text-sm text-slate-500">
                Connecting talent with opportunity across the Philippines.
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
                <li><Link href="#" className="hover:text-slate-900">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              {new Date().getFullYear()} Jobly. All rights reserved.
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
          {[
            { label: 'Home', href: '/', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )},
            { label: 'Jobs', href: '/dashboard/jobs', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )},
            { label: 'Account', href: '/auth', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )},
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500 hover:text-primary-600"
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="h-16 md:hidden" />
    </div>
  );
}
