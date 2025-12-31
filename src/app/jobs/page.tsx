'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  locationType: string;
  salary: string;
  jobType: string;
  department: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
    location: string;
    isVerified: boolean;
  };
  applicationsCount: number;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [workSetupFilter, setWorkSetupFilter] = useState('');

  useEffect(() => {
    async function fetchJobs() {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (locationFilter) params.set('location', locationFilter);
        if (jobTypeFilter) params.set('jobType', jobTypeFilter);

        const response = await fetch(`/api/jobs?${params.toString()}`);
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [searchQuery, locationFilter, jobTypeFilter]);

  const filteredJobs = jobs.filter((job) => {
    if (workSetupFilter && job.locationType !== workSetupFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="Jobly" width={90} height={25} />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/employee/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Sign In
              </Link>
              <Link
                href="/auth/employee/register"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Find Your Dream Job
            </h1>
            <p className="text-primary-100 text-lg">
              Discover thousands of job opportunities across the Philippines
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-2 shadow-lg flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex-1 relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="City or province"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
              <h3 className="font-semibold text-slate-900 mb-4">Filters</h3>

              {/* Job Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Job Type
                </label>
                <select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              {/* Work Setup */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Work Setup
                </label>
                <select
                  value={workSetupFilter}
                  onChange={(e) => setWorkSetupFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Setups</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLocationFilter('');
                  setJobTypeFilter('');
                  setWorkSetupFilter('');
                }}
                className="w-full px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Job Listings */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                {loading ? 'Loading...' : `${filteredJobs.length} Jobs Found`}
              </h2>
              <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>Most Recent</option>
                <option>Most Relevant</option>
                <option>Highest Salary</option>
              </select>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-slate-200 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-5 bg-slate-200 rounded w-1/3 mb-2" />
                        <div className="h-4 bg-slate-200 rounded w-1/4 mb-3" />
                        <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <svg
                  className="w-16 h-16 text-slate-300 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="font-semibold text-slate-900 mb-2">No jobs found</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Try adjusting your search or filters to find more opportunities
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setLocationFilter('');
                    setJobTypeFilter('');
                    setWorkSetupFilter('');
                  }}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block bg-white rounded-xl border border-slate-200 p-6 hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-slate-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-lg flex-shrink-0">
                        {job.company.logo ? (
                          <Image
                            src={job.company.logo}
                            alt={job.company.name}
                            width={56}
                            height={56}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          job.company.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-1">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                              <span>{job.company.name}</span>
                              {job.company.isVerified && (
                                <svg
                                  className="w-4 h-4 text-primary-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 flex-shrink-0">
                            {formatDate(job.createdAt)}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          {job.location && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                              </svg>
                              {job.location}
                            </span>
                          )}
                          {job.jobType && (
                            <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full capitalize">
                              {job.jobType}
                            </span>
                          )}
                          {job.locationType && (
                            <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full capitalize">
                              {job.locationType}
                            </span>
                          )}
                          {job.salary && (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                              {job.salary}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Image src="/logo.svg" alt="Jobly" width={80} height={22} />
              <p className="text-sm text-slate-500">
                Find your dream job in the Philippines
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/terms" className="hover:text-slate-900">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-slate-900">
                Privacy
              </Link>
              <Link href="/auth/employer/login" className="hover:text-slate-900">
                For Employers
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
