'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const jobsData = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'BGC, Taguig',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 120000,
    salaryMax: 180000,
    applicants: 45,
    newApplicants: 8,
    views: 1240,
    posted: '2024-12-20',
    expires: '2025-01-20',
    status: 'Active',
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    department: 'Engineering',
    location: 'BGC, Taguig',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 100000,
    salaryMax: 160000,
    applicants: 38,
    newApplicants: 5,
    views: 980,
    posted: '2024-12-18',
    expires: '2025-01-18',
    status: 'Active',
  },
  {
    id: '3',
    title: 'Product Designer',
    department: 'Design',
    location: 'Makati City',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 80000,
    salaryMax: 120000,
    applicants: 29,
    newApplicants: 3,
    views: 756,
    posted: '2024-12-18',
    expires: '2025-01-18',
    status: 'Active',
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    workSetup: 'Remote',
    salaryMin: 90000,
    salaryMax: 150000,
    applicants: 22,
    newApplicants: 4,
    views: 543,
    posted: '2024-12-10',
    expires: '2025-01-10',
    status: 'Active',
  },
  {
    id: '5',
    title: 'Technical Project Manager',
    department: 'Operations',
    location: 'BGC, Taguig',
    type: 'Full-time',
    workSetup: 'On-site',
    salaryMin: 100000,
    salaryMax: 150000,
    applicants: 18,
    newApplicants: 0,
    views: 432,
    posted: '2024-12-05',
    expires: '2025-01-05',
    status: 'Active',
  },
  {
    id: '6',
    title: 'Junior Software Developer',
    department: 'Engineering',
    location: 'Makati City',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 35000,
    salaryMax: 50000,
    applicants: 89,
    newApplicants: 0,
    views: 1567,
    posted: '2024-11-15',
    expires: '2024-12-15',
    status: 'Closed',
  },
  {
    id: '7',
    title: 'QA Automation Engineer',
    department: 'Engineering',
    location: 'BGC, Taguig',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 60000,
    salaryMax: 90000,
    applicants: 34,
    newApplicants: 0,
    views: 678,
    posted: '2024-11-20',
    expires: '2024-12-20',
    status: 'Paused',
  },
  {
    id: '8',
    title: 'Data Analyst',
    department: 'Analytics',
    location: 'Remote',
    type: 'Full-time',
    workSetup: 'Remote',
    salaryMin: 55000,
    salaryMax: 80000,
    applicants: 56,
    newApplicants: 0,
    views: 890,
    posted: '2024-11-10',
    expires: '2024-12-10',
    status: 'Closed',
  },
];

type Job = typeof jobsData[0];

const formatSalary = (min: number, max: number) => {
  const format = (n: number) => `₱${(n / 1000).toFixed(0)}k`;
  return `${format(min)} - ${format(max)}`;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

function ManageJobsContent() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Handle success notifications from post job page
  useEffect(() => {
    if (searchParams.get('published') === 'true') {
      setNotification({ type: 'success', message: 'Job posted successfully! It is now live and visible to candidates.' });
      // Clear the URL params
      window.history.replaceState({}, '', '/employer/jobs');
    } else if (searchParams.get('draft') === 'true') {
      setNotification({ type: 'info', message: 'Job saved as draft. You can publish it anytime.' });
      window.history.replaceState({}, '', '/employer/jobs');
    }
  }, [searchParams]);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredJobs = jobsData.filter(job => {
    const matchesStatus = statusFilter === 'all' || job.status.toLowerCase() === statusFilter;
    const matchesSearch = !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const toggleSelectJob = (jobId: string) => {
    setSelectedJobs(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map(job => job.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-50 text-green-700';
      case 'Paused': return 'bg-yellow-50 text-yellow-700';
      case 'Closed': return 'bg-slate-100 text-slate-600';
      case 'Draft': return 'bg-blue-50 text-blue-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Success/Info Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
          notification.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className={notification.type === 'success' ? 'text-green-800' : 'text-blue-800'}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className={`p-1 rounded hover:bg-opacity-50 ${
              notification.type === 'success' ? 'hover:bg-green-200 text-green-600' : 'hover:bg-blue-200 text-blue-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Postings</h1>
          <p className="text-slate-600 mt-1">Manage and track all your job listings</p>
        </div>
        <Link
          href="/employer/jobs/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Post New Job
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'paused', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4 flex items-center justify-between">
          <p className="text-sm text-primary-700">
            <span className="font-semibold">{selectedJobs.length}</span> job(s) selected
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100 rounded-lg transition-colors">
              Pause Selected
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Close Selected
            </button>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Job Details</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Applicants</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Views</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Salary</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Posted</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => toggleSelectJob(job.id)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <Link href={`/employer/jobs/${job.id}`} className="font-medium text-slate-900 hover:text-primary-600">
                        {job.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <span>{job.department}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.workSetup}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-medium">{job.applicants}</span>
                      {job.newApplicants > 0 && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          +{job.newApplicants} new
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{job.views.toLocaleString()}</td>
                  <td className="px-5 py-4 text-slate-600">{formatSalary(job.salaryMin, job.salaryMax)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-slate-900 text-sm">{formatDate(job.posted)}</p>
                    <p className="text-slate-500 text-xs">Expires {formatDate(job.expires)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === job.id ? null : job.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      {showActionMenu === job.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                          <Link href={`/employer/jobs/${job.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </Link>
                          <Link href={`/employer/jobs/${job.id}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Job
                          </Link>
                          <Link href={`/employer/applicants?job=${job.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            View Applicants
                          </Link>
                          <hr className="my-1 border-slate-100" />
                          {job.status === 'Active' ? (
                            <button className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 w-full text-left">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Pause Job
                            </button>
                          ) : job.status === 'Paused' ? (
                            <button className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Resume Job
                            </button>
                          ) : null}
                          <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Job
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="font-semibold text-slate-900 mb-2">No jobs found</h3>
            <p className="text-sm text-slate-500 mb-4">Try adjusting your search or filters</p>
            <Link
              href="/employer/jobs/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post Your First Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManageJobsPage() {
  return (
    <Suspense fallback={<div className="p-6 lg:p-8 max-w-7xl mx-auto"><div className="animate-pulse bg-slate-200 h-8 w-48 rounded mb-4"></div></div>}>
      <ManageJobsContent />
    </Suspense>
  );
}
