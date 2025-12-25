'use client';

import { useState } from 'react';

const sampleJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechFlow Solutions',
    location: 'Makati City',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salary: '₱120k - ₱180k',
    posted: '2 days ago',
    description: 'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building user-facing features using React and TypeScript.',
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    experience: 'Senior',
  },
  {
    id: '2',
    title: 'UX/UI Designer',
    company: 'Creative Minds Agency',
    location: 'Remote',
    type: 'Full-time',
    workSetup: 'Remote',
    salary: '₱80k - ₱120k',
    posted: '5 days ago',
    description: 'Join our design team to create beautiful and intuitive user experiences for our clients across various industries.',
    skills: ['Figma', 'Adobe XD', 'Prototyping'],
    experience: 'Mid',
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'StartUp Hub PH',
    location: 'BGC, Taguig',
    type: 'Full-time',
    workSetup: 'On-site',
    salary: '₱100k - ₱150k',
    posted: '1 week ago',
    description: 'Build and maintain scalable web applications using modern technologies. Work closely with product teams to deliver features.',
    skills: ['Node.js', 'React', 'PostgreSQL'],
    experience: 'Mid',
  },
  {
    id: '4',
    title: 'Digital Marketing Specialist',
    company: 'Growth Partners Inc.',
    location: 'Cebu City',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salary: '₱45k - ₱65k',
    posted: '3 days ago',
    description: 'Drive digital marketing campaigns across multiple channels. Analyze performance data and optimize for conversions.',
    skills: ['SEO', 'Google Ads', 'Analytics'],
    experience: 'Entry',
  },
  {
    id: '5',
    title: 'Mobile App Developer',
    company: 'AppWorks Studio',
    location: 'Remote',
    type: 'Contract',
    workSetup: 'Remote',
    salary: '₱100k - ₱150k',
    posted: '1 day ago',
    description: 'Develop cross-platform mobile applications for iOS and Android. Collaborate with designers and backend engineers.',
    skills: ['React Native', 'Flutter', 'Firebase'],
    experience: 'Senior',
  },
  {
    id: '6',
    title: 'Data Analyst',
    company: 'Analytics Pro',
    location: 'Pasig City',
    type: 'Full-time',
    workSetup: 'On-site',
    salary: '₱55k - ₱80k',
    posted: '4 days ago',
    description: 'Analyze large datasets to derive business insights. Create reports and dashboards for stakeholders.',
    skills: ['SQL', 'Python', 'Tableau'],
    experience: 'Entry',
  },
];

type Job = typeof sampleJobs[0];

export default function FindJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Filter states
  const [filters, setFilters] = useState({
    jobType: [] as string[],
    experience: [] as string[],
    workSetup: [] as string[],
    datePosted: '',
  });

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    if (category === 'datePosted') {
      setFilters({ ...filters, datePosted: filters.datePosted === value ? '' : value });
    } else {
      const current = filters[category] as string[];
      if (current.includes(value)) {
        setFilters({ ...filters, [category]: current.filter(v => v !== value) });
      } else {
        setFilters({ ...filters, [category]: [...current, value] });
      }
    }
  };

  const clearFilters = () => {
    setFilters({ jobType: [], experience: [], workSetup: [], datePosted: '' });
  };

  const filteredJobs = sampleJobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = !locationQuery || job.location.toLowerCase().includes(locationQuery.toLowerCase());
    const matchesJobType = filters.jobType.length === 0 || filters.jobType.includes(job.type);
    const matchesExperience = filters.experience.length === 0 || filters.experience.includes(job.experience);
    const matchesWorkSetup = filters.workSetup.length === 0 || filters.workSetup.includes(job.workSetup);
    return matchesSearch && matchesLocation && matchesJobType && matchesExperience && matchesWorkSetup;
  });

  const toggleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-10 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Find Your Dream Job
          </h1>
          <p className="text-slate-300 mb-6">
            Browse thousands of job openings from top companies in the Philippines and abroad.
          </p>

          {/* Search Row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-0 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                placeholder="City, state, or remote"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-0 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Panel */}
          <div className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear all
                </button>
              </div>

              {/* Job Type */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Job Type</h3>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.jobType.includes(type)}
                        onChange={() => toggleFilter('jobType', type)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Experience Level</h3>
                <div className="space-y-2">
                  {['Entry', 'Mid', 'Senior', 'Lead'].map((level) => (
                    <label key={level} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.experience.includes(level)}
                        onChange={() => toggleFilter('experience', level)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Work Setup */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Work Setup</h3>
                <div className="space-y-2">
                  {['On-site', 'Hybrid', 'Remote'].map((setup) => (
                    <label key={setup} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.workSetup.includes(setup)}
                        onChange={() => toggleFilter('workSetup', setup)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600">{setup}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Posted */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 mb-3">Date Posted</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Last 24 hours', value: '24h' },
                    { label: 'Last 7 days', value: '7d' },
                    { label: 'Last 30 days', value: '30d' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="datePosted"
                        checked={filters.datePosted === option.value}
                        onChange={() => toggleFilter('datePosted', option.value)}
                        className="w-4 h-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="flex-1">
            {/* Top row */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
                <p className="text-sm text-slate-600">
                  Showing <span className="font-semibold text-slate-900">{filteredJobs.length}</span> jobs
                </p>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest</option>
                <option value="salary">Salary: High to Low</option>
              </select>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex items-start gap-4">
                    {/* Company Logo Placeholder */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 font-semibold text-sm flex-shrink-0">
                      {job.company.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 text-lg">{job.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <span>{job.company}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {job.location}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{job.posted}</span>
                      </div>

                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{job.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {job.skills.map((skill, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                          {job.salary}
                        </span>
                        <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                          {job.type}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                          className={`p-2 rounded-lg transition-colors ${
                            savedJobs.includes(job.id)
                              ? 'text-yellow-500 bg-yellow-50'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <svg className="w-5 h-5" fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                          className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {filteredJobs.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="font-semibold text-slate-900 mb-1">No jobs found</h3>
                <p className="text-sm text-slate-500">Try adjusting your search or filter criteria</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 font-semibold text-sm">
                  {selectedJob.company.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{selectedJob.title}</h2>
                  <p className="text-sm text-slate-500">{selectedJob.company}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              {/* Quick info */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {selectedJob.location}
                </span>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {selectedJob.type}
                </span>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                  </svg>
                  {selectedJob.workSetup}
                </span>
                <span className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg">
                  {selectedJob.salary}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">Job Description</h3>
                <p className="text-slate-600 leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Posted */}
              <p className="text-sm text-slate-400 mb-6">Posted {selectedJob.posted}</p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => toggleSaveJob(selectedJob.id)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                    savedJobs.includes(selectedJob.id)
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill={savedJobs.includes(selectedJob.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {savedJobs.includes(selectedJob.id) ? 'Saved' : 'Save Job'}
                </button>
                <button className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors">
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
