'use client';

import { useState } from 'react';

const sampleJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechFlow Solutions',
    location: 'Makati',
    type: 'Full-time',
    salary: '120k - 180k',
    posted: '2 days ago',
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    id: '2',
    title: 'UX/UI Designer',
    company: 'Creative Minds Agency',
    location: 'Remote',
    type: 'Full-time',
    salary: '$2,500 - $4,000',
    posted: '5 days ago',
    skills: ['Figma', 'Adobe XD', 'Prototyping'],
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'StartUp Hub PH',
    location: 'BGC, Taguig',
    type: 'Full-time',
    salary: '80k - 120k',
    posted: '1 week ago',
    skills: ['Node.js', 'React', 'PostgreSQL'],
  },
  {
    id: '4',
    title: 'Digital Marketing Specialist',
    company: 'Growth Partners Inc.',
    location: 'Cebu City',
    type: 'Full-time',
    salary: '45k - 65k',
    posted: '3 days ago',
    skills: ['SEO', 'Google Ads', 'Analytics'],
  },
  {
    id: '5',
    title: 'Mobile App Developer',
    company: 'AppWorks Studio',
    location: 'Remote',
    type: 'Contract',
    salary: '100k - 150k',
    posted: '1 day ago',
    skills: ['React Native', 'Flutter', 'Firebase'],
  },
  {
    id: '6',
    title: 'Data Analyst',
    company: 'Analytics Pro',
    location: 'Pasig',
    type: 'Full-time',
    salary: '55k - 80k',
    posted: '4 days ago',
    skills: ['SQL', 'Python', 'Tableau'],
  },
];

export default function FindJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const filteredJobs = sampleJobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationQuery || job.location.toLowerCase().includes(locationQuery.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Find Jobs</h1>
        <p className="text-slate-500 mt-1">Browse open positions</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Job title or keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Location"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {filteredJobs.length} jobs found
        </p>
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option>Most recent</option>
          <option>Salary: High to Low</option>
          <option>Salary: Low to High</option>
        </select>
      </div>

      {/* Job listings */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg border border-slate-200 p-5 hover:border-slate-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm flex-shrink-0">
                {job.company.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-medium text-slate-900">{job.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span>{job.company}</span>
                      <span className="text-slate-300">|</span>
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-medium rounded">
                      {job.salary}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                      {job.type}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{job.posted}</span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="font-medium text-slate-900 mb-1">No jobs found</h3>
          <p className="text-sm text-slate-500">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Pagination */}
      {filteredJobs.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`w-10 h-10 rounded-lg text-sm font-medium ${
                page === 1
                  ? 'bg-primary-600 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
