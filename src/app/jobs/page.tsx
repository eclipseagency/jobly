'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  experienceLevel?: string;
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

// Department categories
const departments = [
  'Technology',
  'Engineering',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Operations',
  'Customer Service',
  'Design',
  'Healthcare',
  'Education',
  'BPO',
  'Admin',
];

// Experience levels
const experienceLevels = [
  { value: 'entry', label: 'Entry Level', color: 'bg-green-50 text-green-700' },
  { value: 'junior', label: 'Junior', color: 'bg-blue-50 text-blue-700' },
  { value: 'mid', label: 'Mid Level', color: 'bg-purple-50 text-purple-700' },
  { value: 'senior', label: 'Senior', color: 'bg-orange-50 text-orange-700' },
  { value: 'lead', label: 'Lead', color: 'bg-red-50 text-red-700' },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getExperienceStyle(level: string): string {
  const styles: Record<string, string> = {
    entry: 'bg-green-50 text-green-700',
    junior: 'bg-blue-50 text-blue-700',
    mid: 'bg-purple-50 text-purple-700',
    senior: 'bg-orange-50 text-orange-700',
    lead: 'bg-red-50 text-red-700',
  };
  return styles[level?.toLowerCase()] || 'bg-slate-100 text-slate-700';
}

function getWorkSetupStyle(setup: string): { icon: string; color: string } {
  const styles: Record<string, { icon: string; color: string }> = {
    remote: { icon: '🌐', color: 'bg-green-50 text-green-700' },
    hybrid: { icon: '🏢', color: 'bg-blue-50 text-blue-700' },
    onsite: { icon: '📍', color: 'bg-slate-100 text-slate-700' },
    'on-site': { icon: '📍', color: 'bg-slate-100 text-slate-700' },
  };
  return styles[setup?.toLowerCase()] || { icon: '📍', color: 'bg-slate-100 text-slate-700' };
}

function getApplicantBadge(count: number): { label: string; color: string } {
  if (count === 0) return { label: 'Be first!', color: 'bg-green-50 text-green-700' };
  if (count < 10) return { label: `${count} applied`, color: 'bg-slate-100 text-slate-600' };
  if (count < 50) return { label: `${count} applied`, color: 'bg-amber-50 text-amber-700' };
  return { label: `${count}+ applied`, color: 'bg-red-50 text-red-700' };
}

function JobsContent() {
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [jobTypeFilter, setJobTypeFilter] = useState(searchParams.get('jobType') || '');
  const [workSetupFilter, setWorkSetupFilter] = useState(searchParams.get('locationType') || '');
  const [departmentFilter, setDepartmentFilter] = useState(searchParams.get('department') || '');
  const [experienceFilter, setExperienceFilter] = useState(searchParams.get('experienceLevel') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (locationFilter) params.set('location', locationFilter);
        if (jobTypeFilter) params.set('jobType', jobTypeFilter);
        if (workSetupFilter) params.set('locationType', workSetupFilter);
        if (departmentFilter) params.set('department', departmentFilter);
        if (experienceFilter) params.set('experienceLevel', experienceFilter);

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
  }, [searchQuery, locationFilter, jobTypeFilter, workSetupFilter, departmentFilter, experienceFilter]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (locationFilter) params.set('location', locationFilter);
    if (jobTypeFilter) params.set('jobType', jobTypeFilter);
    if (workSetupFilter) params.set('locationType', workSetupFilter);
    if (departmentFilter) params.set('department', departmentFilter);
    if (experienceFilter) params.set('experienceLevel', experienceFilter);

    const newUrl = params.toString() ? `/jobs?${params.toString()}` : '/jobs';
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, locationFilter, jobTypeFilter, workSetupFilter, departmentFilter, experienceFilter]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setLocationFilter('');
    setJobTypeFilter('');
    setWorkSetupFilter('');
    setDepartmentFilter('');
    setExperienceFilter('');
  };

  const activeFilterCount = [searchQuery, locationFilter, jobTypeFilter, workSetupFilter, departmentFilter, experienceFilter].filter(Boolean).length;

  return (
    <div className="min-h-full">
      {/* Search Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="px-6 py-8 lg:py-12">
          <div className="max-w-4xl">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Find Your Dream Job</h1>
            <p className="text-primary-100 mb-6">Discover opportunities that match your skills</p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
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
                  className="w-full pl-12 pr-4 py-3.5 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
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
                </svg>
                <input
                  type="text"
                  placeholder="City or province"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-white text-primary-700'
                    : 'bg-primary-500/30 text-white hover:bg-primary-500/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Active Filters Pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white text-sm rounded-full">
                    &quot;{searchQuery}&quot;
                    <button onClick={() => setSearchQuery('')} className="hover:text-white/70">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {locationFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white text-sm rounded-full">
                    📍 {locationFilter}
                    <button onClick={() => setLocationFilter('')} className="hover:text-white/70">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {jobTypeFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white text-sm rounded-full">
                    {jobTypeFilter}
                    <button onClick={() => setJobTypeFilter('')} className="hover:text-white/70">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {workSetupFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white text-sm rounded-full">
                    {workSetupFilter}
                    <button onClick={() => setWorkSetupFilter('')} className="hover:text-white/70">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {departmentFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white text-sm rounded-full">
                    {departmentFilter}
                    <button onClick={() => setDepartmentFilter('')} className="hover:text-white/70">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {experienceFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white text-sm rounded-full">
                    {experienceLevels.find(l => l.value === experienceFilter)?.label || experienceFilter}
                    <button onClick={() => setExperienceFilter('')} className="hover:text-white/70">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-white/80 hover:text-white underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="px-6 pb-6">
            <div className="max-w-4xl bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Category</label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white text-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="">All Categories</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Job Type</label>
                  <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white text-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Work Setup</label>
                  <select
                    value={workSetupFilter}
                    onChange={(e) => setWorkSetupFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white text-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="">All Setups</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Experience</label>
                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white text-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="">All Levels</option>
                    {experienceLevels.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="p-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {loading ? 'Searching...' : `${jobs.length} Jobs Found`}
            </h2>
            {!loading && jobs.length > 0 && (
              <p className="text-sm text-slate-500">Showing all matching results</p>
            )}
          </div>
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
            <option>Most Recent</option>
            <option>Most Relevant</option>
            <option>Highest Salary</option>
          </select>
        </div>

        {/* Job Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-xl" />
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
        ) : jobs.length === 0 ? (
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
              onClick={clearAllFilters}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const workSetup = getWorkSetupStyle(job.locationType);
              const applicantBadge = getApplicantBadge(job.applicationsCount);

              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block bg-white rounded-xl border border-slate-200 p-6 hover:border-primary-200 hover:shadow-lg transition-all group"
                >
                  <div className="flex gap-4">
                    {/* Company Logo */}
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-slate-100 rounded-xl flex items-center justify-center text-primary-600 font-bold text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                      {job.company.logo ? (
                        <Image
                          src={job.company.logo}
                          alt={job.company.name}
                          width={56}
                          height={56}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        job.company.name.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          {/* Title and Company */}
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                              {job.title}
                            </h3>
                            {job.experienceLevel && (
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getExperienceStyle(job.experienceLevel)}`}>
                                {job.experienceLevel}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                            <span className="font-medium">{job.company.name}</span>
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
                        <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">
                          {formatDate(job.createdAt)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                        {job.description}
                      </p>

                      {/* Tags */}
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
                        {job.locationType && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${workSetup.color}`}>
                            <span>{workSetup.icon}</span>
                            {job.locationType}
                          </span>
                        )}
                        {job.jobType && (
                          <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                            {job.jobType}
                          </span>
                        )}
                        {job.salary && !job.salary.includes('₱0') && (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                            {job.salary}
                          </span>
                        )}
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${applicantBadge.color}`}>
                          {applicantBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicJobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    }>
      <JobsContent />
    </Suspense>
  );
}
