'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

interface Applicant {
  id: string;
  status: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  appliedAt: string;
  updatedAt: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    title: string | null;
    location: string | null;
    skills: string[];
    resumeUrl: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    yearsOfExp: number | null;
  };
  job: {
    id: string;
    title: string;
    department: string | null;
  };
}

interface Job {
  id: string;
  title: string;
}

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied', color: 'bg-slate-100 text-slate-600' },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-blue-100 text-blue-700' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-purple-100 text-purple-700' },
  { value: 'interview', label: 'Interview', color: 'bg-amber-100 text-amber-700' },
  { value: 'offered', label: 'Offered', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'hired', label: 'Hired', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

function getStatusStyle(status: string): string {
  const option = STATUS_OPTIONS.find(o => o.value === status);
  return option?.color || 'bg-slate-100 text-slate-600';
}

function getStatusLabel(status: string): string {
  const option = STATUS_OPTIONS.find(o => o.value === status);
  return option?.label || status;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function EmployerApplicantsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterJob, setFilterJob] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch applicants and jobs in parallel
        const [applicantsRes, jobsRes] = await Promise.all([
          fetch('/api/employer/applicants', {
            headers: { 'x-tenant-id': user.id },
          }),
          fetch('/api/employer/jobs', {
            headers: { 'x-tenant-id': user.id },
          }),
        ]);

        if (applicantsRes.ok) {
          const data = await applicantsRes.json();
          setApplicants(data.applicants || []);
        } else {
          setError('Failed to load applicants');
        }

        if (jobsRes.ok) {
          const data = await jobsRes.json();
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Unable to connect. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user?.id]);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    if (!user?.id) return;

    setUpdatingStatus(applicationId);
    try {
      const response = await fetch('/api/employer/applicants', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': user.id,
        },
        body: JSON.stringify({ applicationId, status: newStatus }),
      });

      if (response.ok) {
        setApplicants(prev =>
          prev.map(app =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        );
        toast.success(`Application status updated to ${getStatusLabel(newStatus)}`);
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter applicants
  const filteredApplicants = applicants.filter(app => {
    if (filterJob && app.job.id !== filterJob) return false;
    if (filterStatus && app.status !== filterStatus) return false;
    return true;
  });

  // Group by status for stats
  const statusCounts = applicants.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-slate-200 rounded mt-2 animate-pulse" />
        </div>

        <div className="flex gap-4 mb-6">
          <div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-48 bg-slate-200 rounded" />
                </div>
                <div className="h-8 w-24 bg-slate-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
        <p className="text-slate-500 mt-1">
          {applicants.length === 0
            ? 'Applications will appear here when candidates apply'
            : `${applicants.length} total application${applicants.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Status Stats */}
      {applicants.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_OPTIONS.map(status => {
            const count = statusCounts[status.value] || 0;
            if (count === 0) return null;
            return (
              <button
                key={status.value}
                onClick={() => setFilterStatus(filterStatus === status.value ? '' : status.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filterStatus === status.value
                    ? status.color + ' ring-2 ring-offset-2 ring-slate-300'
                    : status.color + ' opacity-70 hover:opacity-100'
                }`}
              >
                {status.label}: {count}
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      {applicants.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filterJob}
            onChange={(e) => setFilterJob(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>

          {filterStatus && (
            <button
              onClick={() => setFilterStatus('')}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              Clear filter
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {applicants.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="font-semibold text-slate-900 mb-2">No applicants yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            When candidates apply to your job postings, they&apos;ll appear here for you to review.
          </p>
          <Link
            href="/employer/jobs/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            Post a Job
          </Link>
        </div>
      ) : filteredApplicants.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500">No applicants match your current filters.</p>
          <button
            onClick={() => { setFilterJob(''); setFilterStatus(''); }}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplicants.map((applicant) => (
            <div
              key={applicant.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Avatar */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {applicant.candidate.avatar ? (
                    <img
                      src={applicant.candidate.avatar}
                      alt={applicant.candidate.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium flex-shrink-0">
                      {getInitials(applicant.candidate.name)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/employer/dashboard/talent-pool/${applicant.candidate.id}`}
                        className="font-semibold text-slate-900 hover:text-primary-600 transition-colors"
                      >
                        {applicant.candidate.name}
                      </Link>
                      {applicant.candidate.yearsOfExp && (
                        <span className="text-xs text-slate-400">
                          {applicant.candidate.yearsOfExp}+ years exp
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm truncate">
                      {applicant.candidate.title || 'No title'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Link
                        href={`/employer/jobs/${applicant.job.id}`}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        {applicant.job.title}
                      </Link>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400">
                        Applied {formatDate(applicant.appliedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Status dropdown */}
                  <div className="relative">
                    <select
                      value={applicant.status}
                      onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                      disabled={updatingStatus === applicant.id}
                      className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 ${getStatusStyle(applicant.status)}`}
                    >
                      {STATUS_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/employer/dashboard/talent-pool/${applicant.candidate.id}`}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm rounded-lg transition-colors whitespace-nowrap"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/employer/dashboard/messages?candidate=${applicant.candidate.id}`}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Message
                    </Link>
                  </div>
                </div>
              </div>

              {/* Skills preview */}
              {applicant.candidate.skills && applicant.candidate.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                  {applicant.candidate.skills.slice(0, 5).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {applicant.candidate.skills.length > 5 && (
                    <span className="px-2 py-0.5 text-slate-400 text-xs">
                      +{applicant.candidate.skills.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
