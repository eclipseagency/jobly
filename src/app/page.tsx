import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-employee-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-employer-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/25 group-hover:shadow-xl transition-shadow">
              J
            </div>
            <span className="text-2xl font-bold text-slate-800">Jobly</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors shadow-lg shadow-slate-900/20"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-slate-600">Over 10,000 jobs posted this week</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-800 mb-6 animate-slide-up">
              Where{' '}
              <span className="bg-gradient-to-r from-employee-500 to-employee-600 bg-clip-text text-transparent">
                Talent
              </span>{' '}
              Meets{' '}
              <span className="bg-gradient-to-r from-employer-500 to-employer-600 bg-clip-text text-transparent">
                Opportunity
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              The modern platform that connects exceptional professionals with innovative companies.
              Whether you&apos;re searching for your dream role or building your dream team.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link
                href="/auth/employee/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-employee-500 to-employee-600 hover:from-employee-600 hover:to-employee-700 text-white font-semibold text-lg rounded-xl shadow-lg shadow-employee-500/25 hover:shadow-xl hover:shadow-employee-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Jobs
              </Link>
              <Link
                href="/auth/employer/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-employer-500 to-employer-600 hover:from-employer-600 hover:to-employer-700 text-white font-semibold text-lg rounded-xl shadow-lg shadow-employer-500/25 hover:shadow-xl hover:shadow-employer-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Post Jobs
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '2M+', label: 'Active Jobs', color: 'from-employee-500 to-employee-600' },
              { number: '500K+', label: 'Companies Hiring', color: 'from-employer-500 to-employer-600' },
              { number: '10M+', label: 'Job Seekers', color: 'from-primary-500 to-primary-600' },
              { number: '95%', label: 'Success Rate', color: 'from-green-500 to-green-600' },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 text-center animate-fade-in hover:shadow-2xl hover:-translate-y-1 transition-all"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.number}
                </div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Why Choose Jobly?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We&apos;ve reimagined the hiring experience for both job seekers and employers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Lightning Fast Matching',
                description: 'Our AI-powered algorithm matches you with the perfect opportunities or candidates in seconds.',
                gradient: 'from-yellow-400 to-orange-500',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Verified Companies',
                description: 'Every employer on our platform is verified, so you can apply with confidence.',
                gradient: 'from-green-400 to-emerald-500',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Real-Time Analytics',
                description: 'Track your applications or job posts with detailed insights and analytics.',
                gradient: 'from-blue-400 to-indigo-500',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: 'Direct Messaging',
                description: 'Connect directly with employers or candidates without the middleman.',
                gradient: 'from-purple-400 to-pink-500',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Quick Apply',
                description: 'Apply to jobs with a single click using your saved profile.',
                gradient: 'from-employee-400 to-employee-600',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Team Collaboration',
                description: 'Invite your team to review candidates and make hiring decisions together.',
                gradient: 'from-employer-400 to-employer-600',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-employee-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-employer-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Career or Hiring?
              </h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals and companies already using Jobly to achieve their goals.
              </p>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-lg rounded-xl transition-colors shadow-xl"
              >
                Get Started for Free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                J
              </div>
              <span className="text-lg font-bold text-slate-800">Jobly</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-slate-600">
              <Link href="/about" className="hover:text-slate-800 transition-colors">About</Link>
              <Link href="/careers" className="hover:text-slate-800 transition-colors">Careers</Link>
              <Link href="/blog" className="hover:text-slate-800 transition-colors">Blog</Link>
              <Link href="/contact" className="hover:text-slate-800 transition-colors">Contact</Link>
            </div>

            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Jobly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
