import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Us - Jobly Philippines',
  description: 'Learn about Jobly, the trusted job portal connecting Filipino talent with top employers across the Philippines. Our mission, vision, and story.',
  openGraph: {
    title: 'About Jobly Philippines',
    description: 'The trusted job portal connecting Filipino talent with opportunities.',
    url: 'https://www.jobly.ph/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image src="/logo.svg" alt="Jobly" width={100} height={28} priority />
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/jobs" className="text-slate-600 hover:text-slate-900">
                Find Jobs
              </Link>
              <Link href="/blog" className="text-slate-600 hover:text-slate-900">
                Blog
              </Link>
              <Link
                href="/auth"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-cyan-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Jobly
          </h1>
          <p className="text-xl text-white/90">
            Connecting Filipino talent with opportunity across the Philippines and beyond
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-slate-50 rounded-2xl p-8">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed">
                To empower every Filipino professional to find meaningful work that matches their skills and aspirations. We bridge the gap between talented individuals and forward-thinking companies, making the job search process efficient, transparent, and rewarding.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-8">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h2>
              <p className="text-slate-600 leading-relaxed">
                To become the Philippines&apos; most trusted career platform where every job seeker finds their dream role and every employer discovers exceptional talent. We envision a future where finding the right job is just a few clicks away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Our Story</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 mb-6">
              Jobly was founded with a simple yet powerful belief: finding a job shouldn&apos;t be complicated. We saw how talented Filipinos struggled to connect with the right opportunities, while companies searched endlessly for the perfect candidates.
            </p>
            <p className="text-lg text-slate-600 mb-6">
              Our platform was built from the ground up to address these challenges. We combined cutting-edge technology with deep understanding of the Philippine job market to create a seamless experience for both job seekers and employers.
            </p>
            <p className="text-lg text-slate-600">
              Today, Jobly serves thousands of professionals and companies across Metro Manila, Cebu, Davao, and beyond. We&apos;re proud to be part of countless success stories—from fresh graduates landing their first jobs to experienced professionals making career-changing moves.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Trust</h3>
              <p className="text-slate-600">
                We verify employers and protect job seekers from scams, ensuring a safe environment for everyone.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Excellence</h3>
              <p className="text-slate-600">
                We continuously improve our platform to deliver the best possible experience for our users.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Community</h3>
              <p className="text-slate-600">
                We support Filipino workers and businesses, contributing to the growth of our nation&apos;s economy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/90 mb-8">Join thousands of Filipinos who found their dream jobs through Jobly</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/jobs"
              className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Browse Jobs
            </Link>
            <Link
              href="/auth/employer/register"
              className="px-8 py-4 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-800 transition-colors"
            >
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">&copy; {new Date().getFullYear()} Jobly Philippines. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
