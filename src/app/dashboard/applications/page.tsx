'use client';

import { useState } from 'react';

const applications = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechFlow Solutions',
    location: 'Makati, Philippines',
    salary: '₱120k - ₱180k',
    status: 'in_review',
    statusLabel: 'In Review',
    appliedAt: 'Dec 21, 2024',
    lastUpdate: '2 days ago',
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartUp Hub PH',
    location: 'BGC, Taguig',
    salary: '₱80k - ₱120k',
    status: 'interview',
    statusLabel: 'Interview Scheduled',
    appliedAt: 'Dec 18, 2024',
    lastUpdate: '5 days ago',
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    company: 'Creative Minds Agency',
    location: 'Remote',
    salary: '$2,500 - $4,000',
    status: 'applied',
    statusLabel: 'Application Sent',
    appliedAt: 'Dec 16, 2024',
    lastUpdate: '1 week ago',
  },
  {
    id: '4',
    title: 'React Developer',
    company: 'Digital Ventures',
    location: 'Cebu City',
    salary: '₱100k - ₱150k',
    status: 'rejected',
    statusLabel: 'Not Selected',
    appliedAt: 'Dec 10, 2024',
    lastUpdate: '2 weeks ago',
  },
  {
    id: '5',
    title: 'Mobile App Developer',
    company: 'AppWorks Studio',
    location: 'Remote',
    salary: '₱100k - ₱150k',
    status: 'offered',
    statusLabel: 'Offer Received',
    appliedAt: 'Dec 5, 2024',
    lastUpdate: '3 days ago',
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    company: 'CloudTech Systems',
    location: 'Remote',
    salary: '₱130k - ₱200k',
    status: 'in_review',
    statusLabel: 'In Review',
    appliedAt: 'Dec 20, 2024',
    lastUpdate: '3 days ago',
  },
];

const statusConfig: Record<string, { color: string; bgColor: string }> = {
  applied: { color: 'text-slate-700', bgColor: 'bg-slate-100' },
  in_review: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  interview: { color: 'text-green-700', bgColor: 'bg-green-100' },
  offered: { color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  rejected: { color: 'text-red-700', bgColor: 'bg-red-100' },
};

export default function ApplicationsPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApplications = applications.filter((app) => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch =
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: applications.length,
    inReview: applications.filter((a) => a.status === 'in_review').length,
    interviews: applications.filter((a) => a.status === 'interview').length,
    offers: applications.filter((a) => a.status === 'offered').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">My Applications</h1>
        <p className="text-slate-600">Track and manage all your job applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Applications', value: stats.total, color: 'bg-slate-500' },
          { label: 'In Review', value: stats.inReview, color: 'bg-blue-500' },
          { label: 'Interviews', value: stats.interviews, color: 'bg-green-500' },
          { label: 'Offers', value: stats.offers, color: 'bg-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-200">
            <div className={`w-2 h-2 rounded-full ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {[
              { value: 'all', label: 'All' },
              { value: 'in_review', label: 'In Review' },
              { value: 'interview', label: 'Interview' },
              { value: 'offered', label: 'Offered' },
              { value: 'rejected', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === tab.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold">
                  {app.company.substring(0, 2).toUpperCase()}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{app.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                      <span>{app.company}</span>
                      <span>{app.location}</span>
                      <span>{app.salary}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusConfig[app.status].bgColor} ${statusConfig[app.status].color}`}
                  >
                    {app.statusLabel}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>Applied: {app.appliedAt}</span>
                    <span>Last update: {app.lastUpdate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                      View Details
                    </button>
                    {app.status === 'offered' && (
                      <button className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                        Review Offer
                      </button>
                    )}
                    {app.status === 'interview' && (
                      <button className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                        View Schedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No applications found</h3>
          <p className="text-slate-500 mb-4">Start applying to jobs to see them here</p>
          <a
            href="/dashboard/jobs"
            className="inline-flex px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            Browse Jobs
          </a>
        </div>
      )}
    </div>
  );
}
