import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg shadow-primary-500/25">
                J
              </div>
              <span className="text-xl md:text-2xl font-bold text-slate-800">Jobly</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/jobs" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">
                Find Jobs
              </Link>
              <Link href="/auth/employer/login" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">
                For Employers
              </Link>
              <Link href="/about" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">
                About Us
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/auth"
                className="hidden sm:inline-flex px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth"
                className="px-4 py-2 md:px-5 md:py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-primary-600/25 text-sm md:text-base"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-employee-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 w-80 h-80 bg-employer-100 rounded-full opacity-40 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-slate-100 mb-6 md:mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm text-slate-600 font-medium">Trusted by 10k+ Filipino professionals</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-800 mb-6 leading-tight">
              Find your dream job in the{' '}
              <span className="bg-gradient-to-r from-primary-600 via-employee-500 to-employer-500 bg-clip-text text-transparent">
                Philippines
              </span>{' '}
              and beyond.
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-slate-600 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with top employers, showcase your skills, and land the career you deserve.
              Join thousands of professionals today.
            </p>

            {/* Search Box */}
            <div className="max-w-3xl mx-auto mb-10 md:mb-12">
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-3 md:p-4 border border-slate-100">
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Job Title Input */}
                  <div className="flex-1 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Job title or keyword"
                      className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all outline-none"
                    />
                  </div>

                  {/* Location Input */}
                  <div className="flex-1 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Location (e.g., Manila, Cebu)"
                      className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all outline-none"
                    />
                  </div>

                  {/* Search Button */}
                  <button className="w-full md:w-auto px-8 py-3 md:py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12 md:mb-16">
              {[
                { icon: '✓', text: 'Verified Employers', color: 'bg-green-50 text-green-700 border-green-200' },
                { icon: '⚡', text: 'Smart Matching', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { icon: '🎯', text: 'Free for Seekers', color: 'bg-purple-50 text-purple-700 border-purple-200' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${feature.color} text-sm font-medium`}
                >
                  <span>{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8">
              {/* Avatar Stack */}
              <div className="flex items-center">
                <div className="flex -space-x-3">
                  {['bg-gradient-to-br from-pink-400 to-pink-600', 'bg-gradient-to-br from-blue-400 to-blue-600', 'bg-gradient-to-br from-green-400 to-green-600', 'bg-gradient-to-br from-yellow-400 to-yellow-600', 'bg-gradient-to-br from-purple-400 to-purple-600'].map((bg, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-full ${bg} border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-md`}
                    >
                      {['JD', 'MR', 'AK', 'LP', 'SC'][i]}
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">Happy professionals</p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-12 bg-slate-200" />

              {/* Active Users */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-employee-500 to-employee-600 flex items-center justify-center text-white shadow-lg shadow-employee-500/25">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">10k+</p>
                  <p className="text-sm text-slate-500">Active Users</p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-12 bg-slate-200" />

              {/* Join CTA */}
              <Link
                href="/auth/employee/register"
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors group"
              >
                Join the community
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
              How Jobly Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We make it easy to find and apply for jobs that match your skills and career goals.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: '1',
                title: 'Search & Filter',
                description: 'Browse thousands of active job listings. Filter by location, salary, and role to find your perfect match.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                gradient: 'from-blue-500 to-blue-600',
                bgLight: 'bg-blue-50',
              },
              {
                step: '2',
                title: 'Easy Apply',
                description: 'Create your profile once and apply to multiple jobs with a single click. Track your applications in real-time.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                gradient: 'from-employee-500 to-employee-600',
                bgLight: 'bg-employee-50',
              },
              {
                step: '3',
                title: 'Get Hired',
                description: 'Schedule interviews directly through the platform and receive job offers from top companies.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                gradient: 'from-employer-500 to-employer-600',
                bgLight: 'bg-employer-50',
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                {/* Connection Line (hidden on mobile) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-slate-200 to-transparent" />
                )}

                <div className={`relative p-8 rounded-2xl ${item.bgLight} border border-slate-100 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1`}>
                  {/* Step Number */}
                  <div className={`absolute -top-4 left-8 w-8 h-8 rounded-full bg-gradient-to-r ${item.gradient} text-white text-sm font-bold flex items-center justify-center shadow-lg`}>
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { number: '50k+', label: 'Live Jobs', icon: '💼' },
              { number: '20k+', label: 'Companies', icon: '🏢' },
              { number: '100k+', label: 'Candidates', icon: '👥' },
              { number: '15+', label: 'Countries', icon: '🌏' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Portal Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
              Choose Your Path
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Whether you&apos;re looking for your next opportunity or hiring top talent, we&apos;ve got you covered.
            </p>
          </div>

          {/* Two Cards */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Job Seeker Card */}
            <Link href="/auth/employee/register" className="group">
              <div className="h-full bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/50 border-2 border-transparent hover:border-employee-300 transition-all duration-300 group-hover:-translate-y-2">
                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-employee-400 to-employee-600 flex items-center justify-center mb-8 shadow-lg shadow-employee-500/25 group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>

                {/* Content */}
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 group-hover:text-employee-600 transition-colors">
                  For Job Seekers
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Create your profile, upload your resume, and start applying to thousands of jobs from top companies in the Philippines and abroad.
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {['Free to join and apply', 'One-click applications', 'Real-time job alerts', 'Career resources & tips'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600">
                      <svg className="w-5 h-5 text-employee-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-employee-600 font-semibold group-hover:text-employee-700">Create Free Account</span>
                  <div className="w-10 h-10 rounded-full bg-employee-100 flex items-center justify-center text-employee-600 group-hover:bg-employee-600 group-hover:text-white transition-all">
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Employer Card */}
            <Link href="/auth/employer/register" className="group">
              <div className="h-full bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/50 border-2 border-transparent hover:border-employer-300 transition-all duration-300 group-hover:-translate-y-2">
                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-employer-400 to-employer-600 flex items-center justify-center mb-8 shadow-lg shadow-employer-500/25 group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                {/* Content */}
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 group-hover:text-employer-600 transition-colors">
                  For Employers
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Post jobs, manage applications, and hire the best candidates. Our tools make recruiting faster and more efficient.
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {['Post unlimited jobs', 'AI-powered matching', 'Applicant tracking', 'Team collaboration'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600">
                      <svg className="w-5 h-5 text-employer-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-employer-600 font-semibold group-hover:text-employer-700">Post a Job</span>
                  <div className="w-10 h-10 rounded-full bg-employer-100 flex items-center justify-center text-employer-600 group-hover:bg-employer-600 group-hover:text-white transition-all">
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-employer-700 rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-employee-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            </div>

            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to start your career journey?
              </h2>
              <p className="text-lg md:text-xl text-white/80 mb-10">
                Join thousands of professionals who have found their dream jobs through Jobly.
                It&apos;s free and easy to get started.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/employee/register"
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-primary-700 font-semibold text-lg rounded-xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/auth/employer/register"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-lg rounded-xl border-2 border-white/30 transition-all backdrop-blur-sm"
                >
                  Post a Job
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  J
                </div>
                <span className="text-lg font-bold text-white">Jobly</span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Connecting talent with opportunity across the Philippines and the world.
              </p>
              <div className="flex items-center gap-4">
                {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                  <a
                    key={social}
                    href={`#${social}`}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* For Job Seekers */}
            <div>
              <h4 className="text-white font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-3 text-sm">
                {['Browse Jobs', 'Career Advice', 'Resume Tips', 'Salary Guide'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h4 className="text-white font-semibold mb-4">For Employers</h4>
              <ul className="space-y-3 text-sm">
                {['Post a Job', 'Browse Candidates', 'Pricing', 'Enterprise'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Jobly. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span>🇵🇭</span>
              <span>Made with ❤️ in the Philippines</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-50">
        <div className="flex items-center justify-around py-3">
          {[
            { label: 'Home', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            ), href: '/', active: true },
            { label: 'Jobs', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ), href: '/jobs' },
            { label: 'Employers', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ), href: '/auth/employer/login' },
            { label: 'Account', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ), href: '/auth' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 ${item.active ? 'text-primary-600' : 'text-slate-500'}`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Add padding for mobile nav */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
