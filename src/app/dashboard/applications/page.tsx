'use client';

import { useState } from 'react';

const applications = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechFlow Solutions',
    location: 'Makati',
    status: 'in_review',
    statusLabel: 'In Review',
    appliedAt: 'Dec 21, 2024',
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartUp Hub PH',
    location: 'BGC, Taguig',
    status: 'interview',
    statusLabel: 'Interview',
    appliedAt: 'Dec 18, 2024',
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    company: 'Creative Minds Agency',
    location: 'Remote',
    status: 'applied',
    statusLabel: 'Applied',
    appliedAt: 'Dec 16, 2024',
  },
  {
    id: '4',
    title: 'React Developer',
    company: 'Digital Ventures',
    location: 'Cebu City',
    status: 'rejected',
    statusLabel: 'Not Selected',
    appliedAt: 'Dec 10, 2024',
  },
  {
    id: '5',
    title: 'Mobile App Developer',
    company: 'AppWorks Studio',
    location: 'Remote',
    status: 'offer',
    statusLabel: 'Offer Received',
    appliedAt: 'Dec 5, 2024',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'interview': return 'bg-green-50 text-green-600';
    case 'in_review': return 'bg-blue-50 text-blue-600';
    case 'offer': return 'bg-purple-50 text-purple-600';
    case 'rejected': return 'bg-slate-100 text-slate-500';
    default: return 'bg-slate-100 text-slate-600';
  }
};

export default function ApplicationsPage() {
  const [filter, setFilter] = useState('all');

  const filteredApps = filter === 'all'
    ? applications
    : applications.filter(app => app.status === filter);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Applications</h1>
        <p className="text-slate-500 mt-1">Track your job applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: applications.length, color: 'text-slate-900' },
          { label: 'In Review', value: applications.filter(a => a.status === 'in_review').length, color: 'text-blue-600' },
          { label: 'Interviews', value: applications.filter(a => a.status === 'interview').length, color: 'text-green-600' },
          { label: 'Offers', value: applications.filter(a => a.status === 'offer').length, color: 'text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {[
          { key: 'all', label: 'All' },
          { key: 'applied', label: 'Applied' },
          { key: 'in_review', label: 'In Review' },
          { key: 'interview', label: 'Interview' },
          { key: 'offer', label: 'Offer' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="divide-y divide-slate-100">
          {filteredApps.map((app) => (
            <div key={app.id} className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm flex-shrink-0">
                {app.company.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 truncate">{app.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                  <span>{app.company}</span>
                  <span className="text-slate-300">|</span>
                  <span>{app.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(app.status)}`}>
                  {app.statusLabel}
                </span>
                <span className="text-xs text-slate-400 hidden sm:block">{app.appliedAt}</span>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No applications found</p>
        </div>
      )}
    </div>
  );
}
