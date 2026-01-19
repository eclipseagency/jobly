'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

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
  skills?: string[];
}

const formatSalary = (salary: string) => {
  if (!salary || salary.includes('₱0')) return 'Salary not disclosed';
  return salary;
};

// Collapsible filter group component
function FilterGroup({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-sm font-medium text-slate-900">{title}</h3>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
}

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || searchParams.get('search') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [savedJobsMap, setSavedJobsMap] = useState<Record<string, string>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const jobsPerPage = 10;

  const [filters, setFilters] = useState({
    jobType: [] as string[],
    experience: [] as string[],
    workSetup: [] as string[],
    salaryRange: '',
    datePosted: '',
    salaryDisclosedOnly: false,
  });

  // Fetch jobs from API
  useEffect(() => {
    async function loadJobs() {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (locationQuery) params.set('location', locationQuery);

        const response = await fetch(`/api/jobs?${params.toString()}`);
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch {
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadJobs();
  }, [searchQuery, locationQuery]);

  // Load user's saved jobs
  useEffect(() => {
    async function loadSavedJobs() {
      if (!user?.id) return;

      try {
        const response = await fetch('/api/saved-jobs', {
          headers: { 'x-user-id': user.id },
        });
        if (response.ok) {
          const data = await response.json();
          const savedJobIds = data.savedJobs?.map((sj: { job: { id: string } }) => sj.job.id) || [];
          const jobsMap: Record<string, string> = {};
          data.savedJobs?.forEach((sj: { id: string; job: { id: string } }) => {
            jobsMap[sj.job.id] = sj.id;
          });
          setSavedJobs(savedJobIds);
          setSavedJobsMap(jobsMap);
        }
      } catch (error) {
        console.error('Error loading saved jobs:', error);
      }
    }
    loadSavedJobs();
  }, [user?.id]);

  const toggleFilter = (category: keyof typeof filters, value: string | boolean) => {
    if (category === 'salaryRange' || category === 'datePosted') {
      setFilters({ ...filters, [category]: filters[category] === value ? '' : value });
    } else if (category === 'salaryDisclosedOnly') {
      setFilters({ ...filters, salaryDisclosedOnly: !filters.salaryDisclosedOnly });
    } else {
      const current = filters[category] as string[];
      if (current.includes(value as string)) {
        setFilters({ ...filters, [category]: current.filter(v => v !== value) });
      } else {
        setFilters({ ...filters, [category]: [...current, value as string] });
      }
    }
    setCurrentPage(1);
  };

  const removeFilter = (category: keyof typeof filters, value?: string) => {
    if (category === 'salaryRange' || category === 'datePosted') {
      setFilters({ ...filters, [category]: '' });
    } else if (category === 'salaryDisclosedOnly') {
      setFilters({ ...filters, salaryDisclosedOnly: false });
    } else if (value) {
      const current = filters[category] as string[];
      setFilters({ ...filters, [category]: current.filter(v => v !== value) });
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ jobType: [], experience: [], workSetup: [], salaryRange: '', datePosted: '', salaryDisclosedOnly: false });
    setSearchQuery('');
    setLocationQuery('');
    setCurrentPage(1);
  };

  const activeFilterCount = filters.jobType.length + filters.experience.length + filters.workSetup.length +
    (filters.salaryRange ? 1 : 0) + (filters.datePosted ? 1 : 0) + (filters.salaryDisclosedOnly ? 1 : 0);

  const getActiveFilterPills = () => {
    const pills: { category: keyof typeof filters; value: string; label: string }[] = [];
    filters.workSetup.forEach(v => pills.push({ category: 'workSetup', value: v, label: v }));
    filters.experience.forEach(v => pills.push({ category: 'experience', value: v, label: v === 'Entry' ? 'Entry Level' : v === 'Mid' ? 'Mid Level' : v === 'Lead' ? 'Lead/Manager' : v }));
    filters.jobType.forEach(v => pills.push({ category: 'jobType', value: v, label: v }));
    if (filters.salaryRange) {
      const labels: Record<string, string> = { '30-50': '₱30k-50k', '50-80': '₱50k-80k', '80-120': '₱80k-120k', '120-180': '₱120k-180k', '180+': '₱180k+' };
      pills.push({ category: 'salaryRange', value: filters.salaryRange, label: labels[filters.salaryRange] || filters.salaryRange });
    }
    if (filters.datePosted) {
      const labels: Record<string, string> = { '24h': 'Past 24 hours', '7d': 'Past week', '30d': 'Past month' };
      pills.push({ category: 'datePosted', value: filters.datePosted, label: labels[filters.datePosted] || filters.datePosted });
    }
    if (filters.salaryDisclosedOnly) {
      pills.push({ category: 'salaryDisclosedOnly', value: 'true', label: 'Salary disclosed' });
    }
    return pills;
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesJobType = filters.jobType.length === 0 || filters.jobType.includes(job.jobType);
    const matchesExperience = filters.experience.length === 0 ||
      (job.experienceLevel && filters.experience.some(exp => job.experienceLevel?.toLowerCase().includes(exp.toLowerCase())));
    const matchesWorkSetup = filters.workSetup.length === 0 ||
      filters.workSetup.some(setup => job.locationType?.toLowerCase().includes(setup.toLowerCase()));
    const matchesSalaryDisclosed = !filters.salaryDisclosedOnly || (job.salary && !job.salary.includes('₱0'));

    return matchesJobType && matchesExperience && matchesWorkSetup && matchesSalaryDisclosed;
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  const toggleSaveJob = async (jobId: string) => {
    if (!isLoggedIn || !user?.id) {
      setShowLoginModal(true);
      return;
    }

    const isSaved = savedJobs.includes(jobId);

    if (isSaved) {
      const savedJobId = savedJobsMap[jobId];
      if (!savedJobId) return;

      setSavedJobs(prev => prev.filter(id => id !== jobId));
      setSavedJobsMap(prev => {
        const newMap = { ...prev };
        delete newMap[jobId];
        return newMap;
      });

      try {
        const response = await fetch(`/api/saved-jobs/${savedJobId}`, {
          method: 'DELETE',
          headers: { 'x-user-id': user.id },
        });
        if (!response.ok) {
          setSavedJobs(prev => [...prev, jobId]);
          setSavedJobsMap(prev => ({ ...prev, [jobId]: savedJobId }));
        }
      } catch {
        setSavedJobs(prev => [...prev, jobId]);
        setSavedJobsMap(prev => ({ ...prev, [jobId]: savedJobId }));
      }
    } else {
      setSavedJobs(prev => [...prev, jobId]);

      try {
        const response = await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify({ jobId }),
        });

        if (response.ok) {
          const data = await response.json();
          setSavedJobsMap(prev => ({ ...prev, [jobId]: data.savedJob.id }));
        } else {
          setSavedJobs(prev => prev.filter(id => id !== jobId));
        }
      } catch {
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Sign in to save jobs</h3>
            <p className="text-slate-500 text-center mb-8">Create an account or sign in to save jobs and track your applications</p>
            <div className="space-y-3">
              <Link href="/auth/employee/login?redirect=/jobs" onClick={() => setShowLoginModal(false)} className="block w-full py-3 px-4 bg-primary-600 text-white text-center font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/employee/register" onClick={() => setShowLoginModal(false)} className="block w-full py-3 px-4 border-2 border-slate-200 text-slate-700 text-center font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="px-6 py-8">
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
              </svg>
              <input
                type="text"
                placeholder="City or province"
                value={locationQuery}
                onChange={(e) => { setLocationQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-0 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shrink-0">
              Search Jobs
            </button>
          </div>

          {/* Active Filter Pills */}
          {(getActiveFilterPills().length > 0 || searchQuery || locationQuery) && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white text-sm rounded-full">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => { setSearchQuery(''); setCurrentPage(1); }} className="ml-0.5 hover:bg-white/20 rounded-full p-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {locationQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white text-sm rounded-full">
                  📍 {locationQuery}
                  <button onClick={() => { setLocationQuery(''); setCurrentPage(1); }} className="ml-0.5 hover:bg-white/20 rounded-full p-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {getActiveFilterPills().map((pill, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/80 text-white text-sm rounded-full">
                  {pill.label}
                  <button onClick={() => removeFilter(pill.category, pill.value)} className="ml-0.5 hover:bg-white/20 rounded-full p-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              {(getActiveFilterPills().length > 0 || searchQuery || locationQuery) && (
                <button onClick={clearFilters} className="text-sm text-white/70 hover:text-white underline underline-offset-2">
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl border border-slate-200 sticky top-4 flex flex-col max-h-[calc(100vh-8rem)]">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <FilterGroup title="Work Setup" defaultOpen>
                  <div className="space-y-2.5">
                    {[{ value: 'Remote', icon: '🌐' }, { value: 'Hybrid', icon: '🏢' }, { value: 'On-site', icon: '📍' }].map((setup) => (
                      <label key={setup.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.workSetup.includes(setup.value)}
                          onChange={() => toggleFilter('workSetup', setup.value)}
                          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900">{setup.icon} {setup.value}</span>
                      </label>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title="Experience Level" defaultOpen>
                  <div className="space-y-2.5">
                    {[{ value: 'Entry', label: 'Entry Level (0-2 yrs)' }, { value: 'Mid', label: 'Mid Level (2-5 yrs)' }, { value: 'Senior', label: 'Senior (5-8 yrs)' }, { value: 'Lead', label: 'Lead/Manager (8+ yrs)' }].map((level) => (
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
                </FilterGroup>

                <FilterGroup title="Employment Type" defaultOpen>
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
                </FilterGroup>

                <FilterGroup title="Salary Range" defaultOpen>
                  <div className="space-y-2.5">
                    {[{ value: '30-50', label: '₱30k - ₱50k' }, { value: '50-80', label: '₱50k - ₱80k' }, { value: '80-120', label: '₱80k - ₱120k' }, { value: '120-180', label: '₱120k - ₱180k' }, { value: '180+', label: '₱180k+' }].map((range) => (
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
                    <label className="flex items-center gap-3 cursor-pointer group pt-2 border-t border-slate-100 mt-2">
                      <input
                        type="checkbox"
                        checked={filters.salaryDisclosedOnly}
                        onChange={() => toggleFilter('salaryDisclosedOnly', true)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">Salary disclosed only</span>
                    </label>
                  </div>
                </FilterGroup>

                <FilterGroup title="Date Posted">
                  <div className="space-y-2.5">
                    {[{ value: '24h', label: 'Past 24 hours' }, { value: '7d', label: 'Past week' }, { value: '30d', label: 'Past month' }].map((option) => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="datePosted"
                          checked={filters.datePosted === option.value}
                          onChange={() => toggleFilter('datePosted', option.value)}
                          className="w-4 h-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </FilterGroup>
              </div>

              {activeFilterCount > 0 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                  <button onClick={clearFilters} className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    Clear all filters
                  </button>
                </div>
              )}
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
                  Showing <span className="font-semibold text-slate-900">{filteredJobs.length}</span> jobs
                  {searchQuery && <span className="text-slate-400"> for &quot;{searchQuery}&quot;</span>}
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
                  <option value="newest">Newest First</option>
                  <option value="salary">Highest Salary</option>
                  <option value="applicants">Least Applicants</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
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
            ) : paginatedJobs.length === 0 ? (
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
            ) : (
              <div className="space-y-4">
                {paginatedJobs.map((job) => {
                  const expStyles: Record<string, { bg: string; text: string }> = {
                    'entry': { bg: 'bg-teal-50', text: 'text-teal-700' },
                    'junior': { bg: 'bg-blue-50', text: 'text-blue-700' },
                    'mid': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
                    'senior': { bg: 'bg-purple-50', text: 'text-purple-700' },
                    'lead': { bg: 'bg-orange-50', text: 'text-orange-700' },
                  };
                  const expStyle = expStyles[job.experienceLevel?.toLowerCase() || ''] || { bg: 'bg-slate-50', text: 'text-slate-700' };

                  const setupStyles: Record<string, { icon: string; color: string }> = {
                    'remote': { icon: '🌐', color: 'text-green-600' },
                    'hybrid': { icon: '🏢', color: 'text-blue-600' },
                    'onsite': { icon: '📍', color: 'text-slate-600' },
                    'on-site': { icon: '📍', color: 'text-slate-600' },
                  };
                  const setupStyle = setupStyles[job.locationType?.toLowerCase() || ''] || { icon: '📍', color: 'text-slate-600' };

                  const getApplicantCopy = (count: number) => {
                    if (count === 0) return { text: 'Be the first to apply!', color: 'text-green-600' };
                    if (count < 10) return { text: `${count} applicants`, color: 'text-green-600' };
                    if (count < 50) return { text: `${count} applicants`, color: 'text-amber-600' };
                    return { text: `${count} applicants - High interest`, color: 'text-red-600' };
                  };
                  const applicantInfo = getApplicantCopy(job.applicationsCount || 0);

                  return (
                    <article
                      key={job.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary-200 hover:shadow-md transition-all group"
                    >
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-slate-100 border border-slate-200 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                          {job.company.logo ? (
                            <Image src={job.company.logo} alt={job.company.name} width={56} height={56} className="rounded-xl object-cover" />
                          ) : (
                            job.company.name.substring(0, 2).toUpperCase()
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <div>
                                <Link href={`/jobs/${job.id}`} className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                                  {job.title}
                                </Link>
                                <p className="text-sm text-slate-600 mt-0.5">{job.company.name}</p>
                              </div>
                              {job.experienceLevel && (
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${expStyle.bg} ${expStyle.text} whitespace-nowrap`}>
                                  {job.experienceLevel}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-400">{formatDate(job.createdAt)}</span>
                              <span className={`font-medium ${applicantInfo.color}`}>{applicantInfo.text}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-slate-500">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {job.location}
                            </span>
                            <span className={`flex items-center gap-1 font-medium ${setupStyle.color}`}>
                              {setupStyle.icon} {job.locationType}
                            </span>
                            <span className="text-slate-500">{job.jobType}</span>
                          </div>

                          <p className="text-sm text-slate-600 mt-3 line-clamp-2">{job.description}</p>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                            <span className={`text-sm font-semibold ${job.salary && !job.salary.includes('₱0') ? 'text-green-600' : 'text-slate-400'}`}>
                              {formatSalary(job.salary)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                                className={`p-2 rounded-lg transition-colors ${
                                  savedJobs.includes(job.id)
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <svg className="w-5 h-5" fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                              </button>
                              {isLoggedIn ? (
                                <Link
                                  href={`/jobs/${job.id}`}
                                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  Quick Apply
                                </Link>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setShowLoginModal(true); }}
                                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  Quick Apply
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) page = currentPage - 2 + i;
                    if (currentPage > totalPages - 2) page = totalPages - 4 + i;
                  }
                  return (
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
                  );
                })}
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

export default function PublicJobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading jobs...</p>
        </div>
      </div>
    }>
      <JobsContent />
    </Suspense>
  );
}
