'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LocationDropdown } from '@/components/ui/LocationDropdown';
import { useAuth } from '@/contexts/AuthContext';

// Job categories data
const jobCategories = [
  { name: 'Technology', icon: '💻', count: '12,500+', color: 'bg-blue-50 text-blue-600' },
  { name: 'Healthcare', icon: '🏥', count: '8,200+', color: 'bg-green-50 text-green-600' },
  { name: 'Finance', icon: '💰', count: '6,800+', color: 'bg-yellow-50 text-yellow-600' },
  { name: 'Marketing', icon: '📈', count: '5,400+', color: 'bg-purple-50 text-purple-600' },
  { name: 'Education', icon: '📚', count: '4,100+', color: 'bg-red-50 text-red-600' },
  { name: 'Engineering', icon: '⚙️', count: '7,300+', color: 'bg-orange-50 text-orange-600' },
  { name: 'Sales', icon: '🤝', count: '9,600+', color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Design', icon: '🎨', count: '3,200+', color: 'bg-pink-50 text-pink-600' },
];

// Testimonials data
const testimonials = [
  {
    name: 'Maria Santos',
    role: 'Software Engineer',
    company: 'Tech Corp Manila',
    image: '/testimonials/user1.jpg',
    text: 'JOBLY helped me find my dream job in just 2 weeks! The application process was seamless and I got hired at a top tech company.',
    rating: 5,
  },
  {
    name: 'Juan dela Cruz',
    role: 'Marketing Manager',
    company: 'Brand Solutions PH',
    image: '/testimonials/user2.jpg',
    text: 'As an employer, JOBLY made it easy to find qualified candidates. The talent pool feature is amazing for proactive recruiting.',
    rating: 5,
  },
  {
    name: 'Angela Reyes',
    role: 'HR Director',
    company: 'Global Finance Inc.',
    image: '/testimonials/user3.jpg',
    text: 'We\'ve hired over 50 employees through JOBLY. The quality of candidates and the screening tools are exceptional.',
    rating: 5,
  },
];

// Featured companies
const featuredCompanies = [
  { name: 'Accenture', logo: '/companies/accenture.svg' },
  { name: 'Globe', logo: '/companies/globe.svg' },
  { name: 'BDO', logo: '/companies/bdo.svg' },
  { name: 'Jollibee', logo: '/companies/jollibee.svg' },
  { name: 'PLDT', logo: '/companies/pldt.svg' },
  { name: 'Ayala', logo: '/companies/ayala.svg' },
];

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, user, getDashboardPath, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    logo: string;
    isNew: boolean;
  }>>([]);

  // Fetch featured jobs
  useEffect(() => {
    // Simulated featured jobs - in production, fetch from API
    setFeaturedJobs([
      { id: '1', title: 'Senior Software Engineer', company: 'Tech Solutions PH', location: 'Makati City', salary: '₱80,000 - ₱120,000', type: 'Full-time', logo: '/companies/default.svg', isNew: true },
      { id: '2', title: 'Marketing Manager', company: 'Brand Corp', location: 'BGC, Taguig', salary: '₱60,000 - ₱90,000', type: 'Full-time', logo: '/companies/default.svg', isNew: true },
      { id: '3', title: 'UI/UX Designer', company: 'Creative Studio', location: 'Remote', salary: '₱50,000 - ₱70,000', type: 'Full-time', logo: '/companies/default.svg', isNew: false },
      { id: '4', title: 'Data Analyst', company: 'Analytics PH', location: 'Ortigas Center', salary: '₱45,000 - ₱65,000', type: 'Full-time', logo: '/companies/default.svg', isNew: false },
    ]);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 w-full">
        <div className="container-center">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="Jobly" width={100} height={28} priority />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/jobs" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
                Find Jobs
              </Link>
              <Link href="/companies" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
                Companies
              </Link>
              <Link href="/salaries" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
                Salaries
              </Link>
              {isLoggedIn && user?.role === 'employer' ? (
                <Link href="/employer/dashboard" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
                  Employer Dashboard
                </Link>
              ) : (
                <Link href="/employer" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
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
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-primary-600/20"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary-50 py-16 md:py-24 w-full">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full opacity-50 blur-3xl" />
        </div>

        <div className="container-center relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                Over 50,000+ jobs available now
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                Find your <span className="text-primary-600">dream job</span> in the Philippines
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                Connect with top employers, showcase your skills, and take the next step in your career journey. Join over 100,000 professionals who found success with JOBLY.
              </p>

              {/* Search Box */}
              <form onSubmit={handleSearch} className="mt-8">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-2 border border-slate-100">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Job title, keyword, or company"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-0 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-slate-50"
                      />
                    </div>
                    <LocationDropdown
                      value={locationQuery}
                      onChange={setLocationQuery}
                      placeholder="Location"
                      className="flex-1"
                    />
                    <button
                      type="submit"
                      className="shrink-0 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-primary-600/25"
                    >
                      Search Jobs
                    </button>
                  </div>
                </div>
              </form>

              {/* Popular searches */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-500">Popular:</span>
                {['Remote', 'Software Engineer', 'Marketing', 'Accounting', 'BPO'].map((term) => (
                  <Link
                    key={term}
                    href={`/jobs?q=${encodeURIComponent(term)}`}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Column - Stats Cards */}
            <div className="hidden lg:block relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 transform hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">50,000+</div>
                    <div className="text-slate-500 text-sm">Active Job Listings</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 transform hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">100,000+</div>
                    <div className="text-slate-500 text-sm">Registered Job Seekers</div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 transform hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">20,000+</div>
                    <div className="text-slate-500 text-sm">Hiring Companies</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 shadow-lg shadow-primary-600/25 transform hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-white">95%</div>
                    <div className="text-primary-100 text-sm">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-b border-slate-100 w-full bg-white">
        <div className="container-center">
          <p className="text-center text-sm text-slate-500 mb-8">Trusted by leading companies in the Philippines</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {featuredCompanies.map((company) => (
              <div key={company.name} className="h-8 flex items-center">
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={120}
                  height={32}
                  className="h-6 md:h-8 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 md:py-20 w-full bg-white">
        <div className="container-center">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Browse by Category</h2>
              <p className="mt-2 text-slate-600">Explore job opportunities across different industries</p>
            </div>
            <Link href="/jobs" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 group">
              View all categories
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {jobCategories.map((category) => (
              <Link
                key={category.name}
                href={`/jobs?category=${encodeURIComponent(category.name)}`}
                className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-100/50 transition-all"
              >
                <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{category.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{category.count} jobs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 md:py-20 bg-slate-50 w-full">
        <div className="container-center">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Featured Jobs</h2>
              <p className="mt-2 text-slate-600">Hand-picked opportunities from top employers</p>
            </div>
            <Link href="/jobs" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 group">
              Browse all jobs
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {featuredJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors truncate">{job.title}</h3>
                      {job.isNew && (
                        <span className="shrink-0 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">New</span>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm">{job.company}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.type}
                      </span>
                    </div>
                    <div className="mt-3 text-primary-600 font-semibold">{job.salary}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How JOBLY Works */}
      <section className="py-16 md:py-20 bg-white w-full">
        <div className="container-center">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">How JOBLY Works</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">Land your dream job in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: 'Search & Discover',
                description: 'Browse thousands of job listings. Use smart filters to find opportunities that match your skills, experience, and salary expectations.',
              },
              {
                step: '02',
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Apply with Ease',
                description: 'Create your professional profile once, then apply to multiple jobs with a single click. Track all your applications in one dashboard.',
              },
              {
                step: '03',
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ),
                title: 'Get Hired',
                description: 'Connect directly with employers, ace your interviews with our prep tools, and land your dream job. Your success is our mission.',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-slate-50 rounded-2xl p-8 h-full border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                  <div className="absolute -top-3 left-8 px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
                    Step {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-5 mt-2">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-slate-900 w-full">
        <div className="container-center">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">What People Say</h2>
            <p className="mt-3 text-slate-400 max-w-2xl mx-auto">Join thousands of satisfied job seekers and employers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Employers Section */}
      <section className="py-16 md:py-20 w-full bg-white">
        <div className="container-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
                For Employers
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                Find the best talent for your team
              </h2>
              <p className="mt-4 text-lg text-slate-600 leading-relaxed">
                Access our pool of 100,000+ qualified candidates. Post jobs, screen applicants with AI-powered tools, and hire faster than ever.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'AI-powered candidate matching',
                  'Advanced screening & filtering tools',
                  'Talent pool for proactive recruiting',
                  'Team collaboration features',
                  'Analytics & hiring insights',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/auth/employer/register"
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Start Hiring Free
                </Link>
                <Link
                  href="/pricing"
                  className="px-6 py-3 border border-slate-200 text-slate-700 hover:border-slate-300 font-semibold rounded-xl transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-50 to-primary-50 rounded-3xl p-8">
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-slate-900">Hiring Dashboard</h3>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">3 new applicants</span>
                    </div>
                    <div className="space-y-4">
                      {[
                        { name: 'Senior Developer', applicants: 24, status: 'Active' },
                        { name: 'Product Manager', applicants: 18, status: 'Active' },
                        { name: 'UI Designer', applicants: 12, status: 'Review' },
                      ].map((job, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <div className="font-medium text-slate-900 text-sm">{job.name}</div>
                            <div className="text-xs text-slate-500">{job.applicants} applicants</div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {job.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 w-full">
        <div className="container-center">
          <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to take the next step?
              </h2>
              <p className="text-primary-100 mb-8 max-w-xl mx-auto text-lg">
                Join 100,000+ professionals who found their dream jobs through JOBLY.
                Create your free account today and start your journey.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/employee/register"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-lg shadow-primary-900/20"
                >
                  Find Jobs Now
                </Link>
                <Link
                  href="/auth/employer/register"
                  className="w-full sm:w-auto px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Post a Job
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-100 w-full bg-slate-50">
        <div className="container-center">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <Image src="/logo.svg" alt="Jobly" width={90} height={25} />
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Connecting talent with opportunity across the Philippines and beyond.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 bg-slate-200 hover:bg-primary-100 hover:text-primary-600 rounded-lg flex items-center justify-center text-slate-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-slate-200 hover:bg-primary-100 hover:text-primary-600 rounded-lg flex items-center justify-center text-slate-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-slate-200 hover:bg-primary-100 hover:text-primary-600 rounded-lg flex items-center justify-center text-slate-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">For Job Seekers</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/jobs" className="hover:text-primary-600 transition-colors">Browse Jobs</Link></li>
                <li><Link href="/companies" className="hover:text-primary-600 transition-colors">Companies</Link></li>
                <li><Link href="/salaries" className="hover:text-primary-600 transition-colors">Salary Guide</Link></li>
                <li><Link href="/blog" className="hover:text-primary-600 transition-colors">Career Advice</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">For Employers</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/auth/employer/register" className="hover:text-primary-600 transition-colors">Post a Job</Link></li>
                <li><Link href="/pricing" className="hover:text-primary-600 transition-colors">Pricing</Link></li>
                <li><Link href="/employer" className="hover:text-primary-600 transition-colors">Talent Solutions</Link></li>
                <li><Link href="/resources" className="hover:text-primary-600 transition-colors">Resources</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/about" className="hover:text-primary-600 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary-600 transition-colors">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-primary-600 transition-colors">Blog</Link></li>
                <li><Link href="/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Jobly. All rights reserved.
            </p>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              Made with <span className="text-red-500">❤</span> in the Philippines
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-50 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-4 py-2 text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/jobs"
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500 hover:text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">Jobs</span>
          </Link>
          <Link
            href="/companies"
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500 hover:text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs">Companies</span>
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
