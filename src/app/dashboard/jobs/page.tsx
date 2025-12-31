'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { jobs, formatSalary, getSavedJobs, toggleSavedJob, type Job } from '@/lib/jobs-data';

function FindJobsContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  // Load saved jobs from localStorage on mount
  useEffect(() => {
    setSavedJobs(getSavedJobs());
  }, []);

  // Read query params on initial load
  useEffect(() => {
    const q = searchParams.get('q');
    const location = searchParams.get('location');
    if (q) setSearchQuery(q);
    if (location) setLocationQuery(location);
  }, [searchParams]);

  const [filters, setFilters] = useState({
    jobType: [] as string[],
    experience: [] as string[],
    workSetup: [] as string[],
    salaryRange: '',
  });

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    if (category === 'salaryRange') {
      setFilters({ ...filters, salaryRange: filters.salaryRange === value ? '' : value });
    } else {
      const current = filters[category] as string[];
      if (current.includes(value)) {
        setFilters({ ...filters, [category]: current.filter(v => v !== value) });
      } else {
        setFilters({ ...filters, [category]: [...current, value] });
      }
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ jobType: [], experience: [], workSetup: [], salaryRange: '' });
    setCurrentPage(1);
  };

  const activeFilterCount = filters.jobType.length + filters.experience.length + filters.workSetup.length + (filters.salaryRange ? 1 : 0);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = !locationQuery || job.location.toLowerCase().includes(locationQuery.toLowerCase());
    const matchesJobType = filters.jobType.length === 0 || filters.jobType.includes(job.type);
    const matchesExperience = filters.experience.length === 0 || filters.experience.includes(job.experience);
    const matchesWorkSetup = filters.workSetup.length === 0 || filters.workSetup.includes(job.workSetup);

    let matchesSalary = true;
    if (filters.salaryRange) {
      const ranges: Record<string, [number, number]> = {
        '30-50': [30000, 50000],
        '50-80': [50000, 80000],
        '80-120': [80000, 120000],
        '120-180': [120000, 180000],
        '180+': [180000, Infinity],
      };
      const [min, max] = ranges[filters.salaryRange] || [0, Infinity];
      matchesSalary = job.salaryMin >= min || job.salaryMax <= max;
    }

    return matchesSearch && matchesLocation && matchesJobType && matchesExperience && matchesWorkSetup && matchesSalary;
  }).sort((a, b) => {
    if (sortBy === 'newest') return 0; // Already sorted by recency in data
    if (sortBy === 'salary') return b.salaryMax - a.salaryMax;
    return 0;
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  const handleToggleSaveJob = (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleSavedJob(jobId);
    setSavedJobs(result.saved);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/">
                <Image src="/logo.svg" alt="Jobly" width={90} height={25} priority />
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard/jobs" className="text-sm font-medium text-primary-600">Find Jobs</Link>
                <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">Dashboard</Link>
                <Link href="/dashboard/applications" className="text-sm font-medium text-slate-600 hover:text-slate-900">Applications</Link>
                <Link href="/dashboard/saved-jobs" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1">
                  Saved Jobs
                  {savedJobs.length > 0 && (
                    <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                      {savedJobs.length}
                    </span>
                  )}
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <Link href="/dashboard/profile" className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                JS
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Job title, company, or keywords"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-0 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1 lg:max-w-xs relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                placeholder="Location"
                value={locationQuery}
                onChange={(e) => { setLocationQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-0 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shrink-0">
              Search Jobs
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700">
                    Clear ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Job Type */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Employment Type</h3>
                <div className="space-y-2.5">
                  {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.jobType.includes(type)}
                        onChange={() => toggleFilter('jobType', type)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Experience Level</h3>
                <div className="space-y-2.5">
                  {[
                    { value: 'Entry', label: 'Entry Level (0-2 yrs)' },
                    { value: 'Mid', label: 'Mid Level (2-5 yrs)' },
                    { value: 'Senior', label: 'Senior (5-8 yrs)' },
                    { value: 'Lead', label: 'Lead/Manager (8+ yrs)' },
                  ].map((level) => (
                    <label key={level.value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.experience.includes(level.value)}
                        onChange={() => toggleFilter('experience', level.value)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Work Setup */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Work Setup</h3>
                <div className="space-y-2.5">
                  {['On-site', 'Hybrid', 'Remote'].map((setup) => (
                    <label key={setup} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.workSetup.includes(setup)}
                        onChange={() => toggleFilter('workSetup', setup)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{setup}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 mb-3">Salary Range</h3>
                <div className="space-y-2.5">
                  {[
                    { value: '30-50', label: '₱30k - ₱50k' },
                    { value: '50-80', label: '₱50k - ₱80k' },
                    { value: '80-120', label: '₱80k - ₱120k' },
                    { value: '120-180', label: '₱120k - ₱180k' },
                    { value: '180+', label: '₱180k+' },
                  ].map((range) => (
                    <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="salaryRange"
                        checked={filters.salaryRange === range.value}
                        onChange={() => toggleFilter('salaryRange', range.value)}
                        className="w-4 h-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Jobs List */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{filteredJobs.length}</span> jobs found
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="newest">Most Recent</option>
                  <option value="salary">Highest Salary</option>
                </select>
              </div>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {paginatedJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-primary-200 hover:shadow-md transition-all group"
                >
                  <div className="flex gap-4">
                    {/* Company Logo */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-slate-100 border border-slate-200 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                      {job.companyLogo}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-0.5">{job.company}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{job.posted}</span>
                          <span>•</span>
                          <span>{job.applicants} applicants</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                          </svg>
                          {job.workSetup}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mt-3 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {job.skills.slice(0, 4).map((skill, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="text-xs text-slate-400">+{job.skills.length - 4} more</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <span className="text-sm font-semibold text-green-600">
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleToggleSaveJob(job.id, e)}
                            className={`p-2 rounded-lg transition-colors ${
                              savedJobs.includes(job.id)
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                            aria-label={savedJobs.includes(job.id) ? 'Unsave job' : 'Save job'}
                          >
                            <svg className="w-5 h-5" fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                          <span className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg">
                            View Details
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {filteredJobs.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="font-semibold text-slate-900 mb-2">No jobs found</h3>
                <p className="text-sm text-slate-500 mb-4">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 text-sm rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function FindJobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading jobs...</p>
        </div>
      </div>
    }>
      <FindJobsContent />
    </Suspense>
  );
}
