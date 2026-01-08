'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface JobSeeker {
  id: string;
  name: string;
  avatar: string | null;
  title: string;
  currentCompany?: string;
  location: string | null;
  skills: string[];
  experienceLevel: string;
  yearsOfExp: number | null;
  workSetup: string | null;
  availability: string;
  profileCompleteness: number;
  lastActive: string;
  expectedSalary: string | null;
}

interface Filters {
  search: string;
  skills: string[];
  experienceLevel: string;
  minYearsExp: string;
  maxYearsExp: string;
  location: string;
  remotePreference: string;
  availability: string;
  jobType: string;
  minCompleteness: string;
  activelyLooking: boolean;
  lastActiveDays: string;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: Filters;
}

interface Shortlist {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  candidateCount: number;
}

const experienceLevels = [
  { value: '', label: 'All Levels' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Principal' },
  { value: 'manager', label: 'Manager' },
];

const availabilityOptions = [
  { value: '', label: 'Any Availability' },
  { value: 'immediate', label: 'Immediately' },
  { value: '2_weeks', label: 'Within 2 weeks' },
  { value: '1_month', label: 'Within 1 month' },
  { value: '3_months', label: 'Within 3 months' },
];

const workSetupOptions = [
  { value: '', label: 'Any Setup' },
  { value: 'remote', label: 'Remote Only' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

const jobTypeOptions = [
  { value: '', label: 'Any Type' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
];

const lastActiveOptions = [
  { value: '', label: 'Any Time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

const popularSkills = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'SQL',
  'AWS', 'Docker', 'Git', 'CSS', 'HTML', 'MongoDB', 'PostgreSQL', 'GraphQL',
];

const defaultFilters: Filters = {
  search: '',
  skills: [],
  experienceLevel: '',
  minYearsExp: '',
  maxYearsExp: '',
  location: '',
  remotePreference: '',
  availability: '',
  jobType: '',
  minCompleteness: '',
  activelyLooking: false,
  lastActiveDays: '',
};

export default function TalentPoolPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [shortlists, setShortlists] = useState<Shortlist[]>([]);
  const [showCreateShortlistModal, setShowCreateShortlistModal] = useState(false);
  const [newShortlist, setNewShortlist] = useState({ name: '', description: '', color: '#3b82f6' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/employer/login');
    }
  }, [isLoggedIn, router]);

  // Load saved filters and shortlists
  useEffect(() => {
    async function loadSavedFilters() {
      if (!user?.id) return;
      try {
        const response = await fetch('/api/employer/saved-filters', {
          headers: { 'x-tenant-id': user.id },
        });
        if (response.ok) {
          const data = await response.json();
          setSavedFilters(data.filters || []);
        }
      } catch {
        // Error loading saved filters
      }
    }

    async function loadShortlists() {
      if (!user?.id) return;
      try {
        const response = await fetch('/api/employer/shortlists', {
          headers: { 'x-tenant-id': user.id },
        });
        if (response.ok) {
          const data = await response.json();
          setShortlists(data.shortlists || []);
        }
      } catch {
        // Error loading shortlists
      }
    }

    loadSavedFilters();
    loadShortlists();
  }, [user?.id]);

  // Fetch job seekers
  const fetchJobSeekers = useCallback(async (page = 1) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');

      if (filters.search) params.set('search', filters.search);
      if (filters.skills.length > 0) params.set('skills', filters.skills.join(','));
      if (filters.experienceLevel) params.set('experienceLevel', filters.experienceLevel);
      if (filters.minYearsExp) params.set('minYearsExp', filters.minYearsExp);
      if (filters.maxYearsExp) params.set('maxYearsExp', filters.maxYearsExp);
      if (filters.location) params.set('location', filters.location);
      if (filters.remotePreference) params.set('remotePreference', filters.remotePreference);
      if (filters.availability) params.set('availability', filters.availability);
      if (filters.jobType) params.set('jobType', filters.jobType);
      if (filters.minCompleteness) params.set('minCompleteness', filters.minCompleteness);
      if (filters.activelyLooking) params.set('activelyLooking', 'true');
      if (filters.lastActiveDays) params.set('lastActiveDays', filters.lastActiveDays);

      const response = await fetch(`/api/employer/talent-pool?${params.toString()}`, {
        headers: { 'x-tenant-id': user.id },
      });

      if (response.ok) {
        const data = await response.json();
        setJobSeekers(data.jobSeekers || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      }
    } catch {
      setJobSeekers([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters]);

  useEffect(() => {
    fetchJobSeekers();
  }, [fetchJobSeekers]);

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string | boolean | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Add skill to filter
  const addSkillFilter = (skill: string) => {
    if (skill && !filters.skills.includes(skill)) {
      setFilters(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
    setSkillInput('');
  };

  // Remove skill from filter
  const removeSkillFilter = (skill: string) => {
    setFilters(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  // Save current filter
  const saveFilter = async () => {
    if (!user?.id || !newFilterName.trim()) return;
    try {
      const response = await fetch('/api/employer/saved-filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': user.id,
        },
        body: JSON.stringify({
          name: newFilterName.trim(),
          filters,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSavedFilters(prev => [data.filter, ...prev]);
        setShowSaveFilterModal(false);
        setNewFilterName('');
      }
    } catch {
      // Error saving filter
    }
  };

  // Apply saved filter
  const applySavedFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters as Filters);
  };

  // Delete saved filter
  const deleteSavedFilter = async (filterId: string) => {
    if (!user?.id) return;
    try {
      await fetch(`/api/employer/saved-filters?id=${filterId}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': user.id },
      });
      setSavedFilters(prev => prev.filter(f => f.id !== filterId));
    } catch {
      // Error deleting filter
    }
  };

  // Create shortlist
  const createShortlist = async () => {
    if (!user?.id || !newShortlist.name.trim()) return;
    try {
      const response = await fetch('/api/employer/shortlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': user.id,
        },
        body: JSON.stringify(newShortlist),
      });

      if (response.ok) {
        const data = await response.json();
        setShortlists(prev => [{ ...data.shortlist, candidateCount: 0 }, ...prev]);
        setShowCreateShortlistModal(false);
        setNewShortlist({ name: '', description: '', color: '#3b82f6' });
      }
    } catch {
      // Error creating shortlist
    }
  };

  // Delete shortlist
  const deleteShortlist = async (shortlistId: string) => {
    if (!user?.id) return;
    try {
      await fetch(`/api/employer/shortlists?id=${shortlistId}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': user.id },
      });
      setShortlists(prev => prev.filter(s => s.id !== shortlistId));
    } catch {
      // Error deleting shortlist
    }
  };

  // Get experience level label
  const getExperienceLevelLabel = (level: string) => {
    const found = experienceLevels.find(l => l.value === level);
    return found?.label || level || 'Entry Level';
  };

  // Get availability label
  const getAvailabilityLabel = (availability: string) => {
    const labels: Record<string, string> = {
      immediate: 'Available now',
      '2_weeks': 'In 2 weeks',
      '1_month': 'In 1 month',
      '3_months': 'In 3 months',
      open: 'Open to offers',
      not_looking: 'Not looking',
    };
    return labels[availability] || 'Open to offers';
  };

  // Format last active date
  const formatLastActive = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Count active filters
  const activeFilterCount = [
    filters.search,
    filters.skills.length > 0,
    filters.experienceLevel,
    filters.minYearsExp || filters.maxYearsExp,
    filters.location,
    filters.remotePreference,
    filters.availability,
    filters.jobType,
    filters.minCompleteness,
    filters.activelyLooking,
    filters.lastActiveDays,
  ].filter(Boolean).length;

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Talent Pool</h1>
          <p className="text-slate-600 mt-1">
            Browse and connect with qualified job seekers
          </p>
        </div>
        <button
          onClick={() => setShowCreateShortlistModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Shortlist
        </button>
      </div>

      {/* Shortlists Section */}
      {shortlists.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900">Your Shortlists</h2>
            <span className="text-sm text-slate-500">{shortlists.length} list{shortlists.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {shortlists.map(sl => (
              <div
                key={sl.id}
                className="group flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sl.color || '#3b82f6' }}
                />
                <span className="text-sm font-medium text-slate-700">{sl.name}</span>
                <span className="text-xs text-slate-500">({sl.candidateCount})</span>
                <button
                  onClick={() => deleteShortlist(sl.id)}
                  className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete shortlist"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name, title, or skills..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-primary-600 text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Saved Filters Dropdown */}
          {savedFilters.length > 0 && (
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Saved Filters
              </button>
              <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="p-2">
                  {savedFilters.map(sf => (
                    <div key={sf.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                      <button
                        onClick={() => applySavedFilter(sf)}
                        className="flex-1 text-left text-sm text-slate-700 truncate"
                      >
                        {sf.name}
                      </button>
                      <button
                        onClick={() => deleteSavedFilter(sf.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Skills Filter */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {filters.skills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm">
                      {skill}
                      <button onClick={() => removeSkillFilter(skill)} className="hover:text-primary-900">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkillFilter(skillInput)}
                    placeholder="Add skill..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={() => addSkillFilter(skillInput)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {popularSkills.slice(0, 8).map(skill => (
                    <button
                      key={skill}
                      onClick={() => addSkillFilter(skill)}
                      disabled={filters.skills.includes(skill)}
                      className="px-2 py-0.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-50"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  {experienceLevels.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="City or country..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Work Setup */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work Setup</label>
                <select
                  value={filters.remotePreference}
                  onChange={(e) => handleFilterChange('remotePreference', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  {workSetupOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Availability</label>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  {availabilityOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                <select
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  {jobTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Last Active */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Active</label>
                <select
                  value={filters.lastActiveDays}
                  onChange={(e) => handleFilterChange('lastActiveDays', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  {lastActiveOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Min Profile Completeness */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Min Profile %</label>
                <select
                  value={filters.minCompleteness}
                  onChange={(e) => handleFilterChange('minCompleteness', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  <option value="50">50% or more</option>
                  <option value="70">70% or more</option>
                  <option value="80">80% or more</option>
                  <option value="90">90% or more</option>
                </select>
              </div>

              {/* Years of Experience Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={filters.minYearsExp}
                    onChange={(e) => handleFilterChange('minYearsExp', e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    min="0"
                    value={filters.maxYearsExp}
                    onChange={(e) => handleFilterChange('maxYearsExp', e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={clearFilters}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Clear all filters
              </button>
              <button
                onClick={() => setShowSaveFilterModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-600">
          {loading ? 'Loading...' : `${pagination.total} job seeker${pagination.total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Job Seekers List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : jobSeekers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No job seekers found</h3>
          <p className="text-slate-600 mb-4">Try adjusting your filters or search criteria</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobSeekers.map(seeker => (
            <Link
              key={seeker.id}
              href={`/employer/dashboard/talent-pool/${seeker.id}`}
              className="block bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all p-4"
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {seeker.avatar ? (
                    <img
                      src={seeker.avatar}
                      alt={seeker.name || 'Profile'}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg">
                      {(seeker.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{seeker.name || 'Job Seeker'}</h3>
                      <p className="text-sm text-slate-600">{seeker.title}</p>
                      {seeker.currentCompany && (
                        <p className="text-xs text-slate-500">at {seeker.currentCompany}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        seeker.availability === 'immediate' ? 'bg-green-100 text-green-700' :
                        seeker.availability === 'open' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {getAvailabilityLabel(seeker.availability)}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">Active {formatLastActive(seeker.lastActive)}</p>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {seeker.location || 'Location not specified'}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {getExperienceLevelLabel(seeker.experienceLevel)}
                    </span>
                    {seeker.workSetup && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {seeker.workSetup === 'remote' ? 'Remote' : seeker.workSetup === 'hybrid' ? 'Hybrid' : 'On-site'}
                      </span>
                    )}
                  </div>

                  {/* Skills */}
                  {seeker.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {seeker.skills.slice(0, 5).map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {seeker.skills.length > 5 && (
                        <span className="px-2 py-0.5 text-slate-400 text-xs">
                          +{seeker.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Profile completeness bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                      <div
                        className={`h-full transition-all ${
                          seeker.profileCompleteness >= 80 ? 'bg-green-500' :
                          seeker.profileCompleteness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${seeker.profileCompleteness}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{seeker.profileCompleteness}% complete</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => fetchJobSeekers(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchJobSeekers(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Save Filter Modal */}
      {showSaveFilterModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Save Filter</h3>
            <input
              type="text"
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
              placeholder="Filter name (e.g., 'Senior React Devs - Remote')"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveFilterModal(false);
                  setNewFilterName('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveFilter}
                disabled={!newFilterName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Shortlist Modal */}
      {showCreateShortlistModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Shortlist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newShortlist.name}
                  onChange={(e) => setNewShortlist(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., 'Senior Engineers', 'Marketing Team'"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newShortlist.description}
                  onChange={(e) => setNewShortlist(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this shortlist"
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                <div className="flex gap-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewShortlist(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-transform ${newShortlist.color === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateShortlistModal(false);
                  setNewShortlist({ name: '', description: '', color: '#3b82f6' });
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createShortlist}
                disabled={!newShortlist.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
              >
                Create Shortlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
