'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LocationDropdown } from '@/components/ui/LocationDropdown';
import { jobSeekerAPI, Job as APIJob } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: string;
  workSetup: string;
  salaryMin: number;
  salaryMax: number;
  posted: string;
  applicants: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  experience: string;
}

function mapAPIJob(job: APIJob): Job {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    companyLogo: job.companyLogo || job.company.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
    location: job.location,
    type: job.type,
    workSetup: job.workSetup,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    posted: job.posted,
    applicants: job.applicants,
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    benefits: job.benefits,
    skills: job.skills,
    experience: job.experience,
  };
}

const formatSalary = (min: number, max: number) => {
  if (min === 0 && max === 0) return 'Salary not disclosed';
  const formatNum = (n: number) => {
    if (n >= 1000) return `₱${(n / 1000).toFixed(0)}k`;
    return `₱${n}`;
  };
  return `${formatNum(min)} - ${formatNum(max)}/mo`;
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

function FindJobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [savedJobsMap, setSavedJobsMap] = useState<Record<string, string>>({}); // jobId -> savedJobId
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  // Fetch jobs from API
  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await jobSeekerAPI.getJobs();
        setJobs(data.length > 0 ? data.map(mapAPIJob) : []);
      } catch {
        // Failed to load - show empty state
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadJobs();
  }, []);

  // Read query params on initial load
  useEffect(() => {
    const q = searchParams.get('q');
    const location = searchParams.get('location');
    if (q) setSearchQuery(q);
    if (location) setLocationQuery(location);
  }, [searchParams]);

  // Load user's saved jobs
  useEffect(() => {
    async function loadSavedJobs() {
      if (!user?.id) return;

      try {
        const response = await fetch('/api/saved-jobs', {
          headers: {
            'x-user-id': user.id,
          },
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

  const [filters, setFilters] = useState({
    jobType: [] as string[],
    experience: [] as string[],
    workSetup: [] as string[],
    salaryRange: '',
    datePosted: '', // Added: date posted filter
    salaryDisclosedOnly: false, // Added: only show jobs with salary
  });

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

  // Get display labels for filter pills
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
    const matchesSearch = !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = !locationQuery || job.location.toLowerCase().includes(locationQuery.toLowerCase());
    const matchesJobType = filters.jobType.length === 0 || filters.jobType.includes(job.type);
    const matchesExperience = filters.experience.length === 0 || filters.experience.includes(job.experience);
    const matchesWorkSetup = filters.workSetup.length === 0 || filters.workSetup.includes(job.workSetup);

    // Salary range filter
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
      matchesSalary = job.salaryMax >= min && job.salaryMin <= max;
    }

    // Salary disclosed only filter
    const matchesSalaryDisclosed = !filters.salaryDisclosedOnly ||
      (job.salaryMin > 0 && job.salaryMax > 0);

    // Date posted filter (based on posted text - in real app would use timestamp)
    let matchesDatePosted = true;
    if (filters.datePosted) {
      const postedLower = job.posted.toLowerCase();
      if (filters.datePosted === '24h') {
        matchesDatePosted = postedLower.includes('hour') || postedLower.includes('minute');
      } else if (filters.datePosted === '7d') {
        matchesDatePosted = postedLower.includes('hour') || postedLower.includes('minute') ||
          (postedLower.includes('day') && !postedLower.includes('week'));
      } else if (filters.datePosted === '30d') {
        matchesDatePosted = !postedLower.includes('month') && !postedLower.includes('year');
      }
    }

    return matchesSearch && matchesLocation && matchesJobType && matchesExperience &&
      matchesWorkSetup && matchesSalary && matchesSalaryDisclosed && matchesDatePosted;
  }).sort((a, b) => {
    if (sortBy === 'newest') return 0; // Already sorted by recency in data
    if (sortBy === 'salary') return b.salaryMax - a.salaryMax;
    if (sortBy === 'applicants') return a.applicants - b.applicants; // Least applicants first
    return 0;
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  const toggleSaveJob = async (jobId: string) => {
    if (!isLoggedIn || !user?.id) {
      router.push(`/auth/employee/login?redirect=/dashboard/jobs`);
      return;
    }

    const isSaved = savedJobs.includes(jobId);

    if (isSaved) {
      // Unsave the job
      const savedJobId = savedJobsMap[jobId];
      if (!savedJobId) return;

      // Optimistically update UI
      setSavedJobs(prev => prev.filter(id => id !== jobId));
      setSavedJobsMap(prev => {
        const newMap = { ...prev };
        delete newMap[jobId];
        return newMap;
      });

      try {
        const response = await fetch(`/api/saved-jobs/${savedJobId}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': user.id,
          },
        });

        if (!response.ok) {
          // Revert on failure
          setSavedJobs(prev => [...prev, jobId]);
          setSavedJobsMap(prev => ({ ...prev, [jobId]: savedJobId }));
        }
      } catch (error) {
        console.error('Error unsaving job:', error);
        // Revert on failure
        setSavedJobs(prev => [...prev, jobId]);
        setSavedJobsMap(prev => ({ ...prev, [jobId]: savedJobId }));
      }
    } else {
      // Save the job
      // Optimistically update UI
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
          // Revert on failure
          setSavedJobs(prev => prev.filter(id => id !== jobId));
        }
      } catch (error) {
        console.error('Error saving job:', error);
        // Revert on failure
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      }
    }
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
            <LocationDropdown
              value={locationQuery}
              onChange={(value) => { setLocationQuery(value); setCurrentPage(1); }}
              placeholder="Select location"
              className="flex-1 lg:max-w-xs"
            />
            <button className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shrink-0">
              Search Jobs
            </button>
          </div>

          {/* Active Filter Pills */}
          {(getActiveFilterPills().length > 0 || searchQuery || locationQuery) && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white text-sm rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  &quot;{searchQuery}&quot;
                  <button
                    onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                    className="ml-0.5 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {locationQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white text-sm rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {locationQuery}
                  <button
                    onClick={() => { setLocationQuery(''); setCurrentPage(1); }}
                    className="ml-0.5 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {getActiveFilterPills().map((pill, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/80 text-white text-sm rounded-full">
                  {pill.label}
                  <button
                    onClick={() => removeFilter(pill.category, pill.value)}
                    className="ml-0.5 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              {(getActiveFilterPills().length > 0 || searchQuery || locationQuery) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-white/70 hover:text-white underline underline-offset-2"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl border border-slate-200 sticky top-24 flex flex-col max-h-[calc(100vh-8rem)]">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>

              {/* Scrollable Filter Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Work Setup - First priority */}
                <FilterGroup title="Work Setup" defaultOpen>
                  <div className="space-y-2.5">
                    {[
                      { value: 'Remote', icon: '🌐' },
                      { value: 'Hybrid', icon: '🏢' },
                      { value: 'On-site', icon: '📍' },
                    ].map((setup) => (
                      <label key={setup.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.workSetup.includes(setup.value)}
                          onChange={() => toggleFilter('workSetup', setup.value)}
                          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900">
                          {setup.icon} {setup.value}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterGroup>

                {/* Experience Level */}
                <FilterGroup title="Experience Level" defaultOpen>
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
                </FilterGroup>

                {/* Employment Type */}
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

                {/* Salary Range */}
                <FilterGroup title="Salary Range" defaultOpen>
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

                {/* Date Posted */}
                <FilterGroup title="Date Posted">
                  <div className="space-y-2.5">
                    {[
                      { value: '24h', label: 'Past 24 hours' },
                      { value: '7d', label: 'Past week' },
                      { value: '30d', label: 'Past month' },
                    ].map((option) => (
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

              {/* Sticky Footer */}
              {activeFilterCount > 0 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
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
                  Showing <span className="font-semibold text-slate-900">{filteredJobs.length}</span> of {jobs.length} jobs
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

            {/* Job Cards */}
            <div className="space-y-4">
              {paginatedJobs.map((job) => {
                // Experience level styling
                const experienceStyles: Record<string, { bg: string; text: string }> = {
                  'Entry': { bg: 'bg-teal-50', text: 'text-teal-700' },
                  'Mid': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
                  'Senior': { bg: 'bg-purple-50', text: 'text-purple-700' },
                  'Lead': { bg: 'bg-orange-50', text: 'text-orange-700' },
                };
                const expStyle = experienceStyles[job.experience] || { bg: 'bg-slate-50', text: 'text-slate-700' };

                // Work setup styling
                const workSetupStyles: Record<string, { icon: string; color: string }> = {
                  'Remote': { icon: '🌐', color: 'text-green-600' },
                  'Hybrid': { icon: '🏢', color: 'text-blue-600' },
                  'On-site': { icon: '📍', color: 'text-slate-600' },
                };
                const setupStyle = workSetupStyles[job.workSetup] || { icon: '📍', color: 'text-slate-600' };

                // Applicant interest copy
                const getApplicantCopy = (count: number) => {
                  if (count === 0) return { text: 'Be the first to apply!', color: 'text-green-600' };
                  if (count < 10) return { text: `${count} applicants`, color: 'text-green-600' };
                  if (count < 50) return { text: `${count} applicants`, color: 'text-amber-600' };
                  return { text: `${count} applicants - High interest`, color: 'text-red-600' };
                };
                const applicantInfo = getApplicantCopy(job.applicants);

                return (
                  <article
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex gap-4">
                      {/* Company Logo */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-slate-100 border border-slate-200 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                        {job.companyLogo}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Row 1: Title + Company + Experience Level */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <div>
                              <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                                {job.title}
                              </h3>
                              <p className="text-sm text-slate-600 mt-0.5">{job.company}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${expStyle.bg} ${expStyle.text} whitespace-nowrap`}>
                              {job.experience === 'Entry' ? 'Entry Level' : job.experience === 'Lead' ? 'Lead/Manager' : job.experience}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">{job.posted}</span>
                            <span className={`font-medium ${applicantInfo.color}`}>{applicantInfo.text}</span>
                          </div>
                        </div>

                        {/* Row 2: Location + Work Setup + Employment Type */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-slate-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {job.location}
                          </span>
                          <span className={`flex items-center gap-1 font-medium ${setupStyle.color}`}>
                            {setupStyle.icon} {job.workSetup}
                          </span>
                          <span className="text-slate-500">{job.type}</span>
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

                        {/* Row 3: Salary + Applicants + Actions */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-semibold ${job.salaryMin === 0 && job.salaryMax === 0 ? 'text-slate-400' : 'text-green-600'}`}>
                              {formatSalary(job.salaryMin, job.salaryMax)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
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
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Quick Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
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

      {/* Job Detail Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white w-full max-w-3xl my-8 mx-4 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 rounded-t-2xl flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-slate-100 border border-slate-200 flex items-center justify-center text-primary-600 font-bold">
                  {selectedJob.companyLogo}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedJob.title}</h2>
                  <p className="text-slate-600">{selectedJob.company}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 -mr-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              {/* Job Meta */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {selectedJob.location}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {selectedJob.type}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                  </svg>
                  {selectedJob.workSetup}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg">
                  {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}
                </span>
              </div>

              {/* Description */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">About This Role</h3>
                <p className="text-slate-600 leading-relaxed">{selectedJob.description}</p>
              </section>

              {/* Responsibilities */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Responsibilities</h3>
                <ul className="space-y-2">
                  {selectedJob.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Requirements */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {selectedJob.requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Skills */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* Benefits */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.benefits.map((benefit, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg">
                      {benefit}
                    </span>
                  ))}
                </div>
              </section>

              {/* Posted Info */}
              <p className="text-sm text-slate-400 mb-6">
                Posted {selectedJob.posted} · {selectedJob.applicants} applicants
              </p>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => toggleSaveJob(selectedJob.id)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                    savedJobs.includes(selectedJob.id)
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill={savedJobs.includes(selectedJob.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {savedJobs.includes(selectedJob.id) ? 'Saved' : 'Save Job'}
                </button>
                <button
                  onClick={() => router.push(`/jobs/${selectedJob.id}`)}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
