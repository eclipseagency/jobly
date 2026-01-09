'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  locationType: string | null;
  salary: string | null;
  jobType: string | null;
  department: string | null;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
  applicationsCount: number;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(dateString);
}

function getStatusBadge(job: Job): { label: string; className: string } {
  if (!job.isActive) {
    return { label: 'Closed', className: 'bg-slate-100 text-slate-600' };
  }
  if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
    return { label: 'Expired', className: 'bg-amber-100 text-amber-700' };
  }
  return { label: 'Active', className: 'bg-emerald-100 text-emerald-700' };
}

export default function EmployerJobsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/employer/jobs', {
          headers: {
            'x-tenant-id': user.id,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
        } else {
          setError('Failed to load jobs');
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Unable to connect. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [user?.id]);

  const handleToggleStatus = async (jobId: string, currentlyActive: boolean) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': user.id,
        },
        body: JSON.stringify({ isActive: !currentlyActive }),
      });

      if (response.ok) {
        setJobs(prev => prev.map(job =>
          job.id === jobId ? { ...job, isActive: !currentlyActive } : job
        ));
        toast.success(currentlyActive ? 'Job posting closed' : 'Job posting activated');
      } else {
        toast.error('Failed to update job status');
      }
    } catch {
      toast.error('Failed to update job status');
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-slate-200 rounded mt-2 animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-lg animate-pulse">
                <div className="flex-1">
                  <div className="h-5 w-48 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded-full" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-8 w-16 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Postings</h1>
          <p className="text-slate-500 mt-1">
            {jobs.length === 0 ? 'Start posting jobs to find great talent' : `Managing ${jobs.length} job${jobs.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/employer/jobs/new"
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Post New Job
        </Link>
      </div>

      {/* Empty state */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="font-semibold text-slate-900 mb-2">No job postings yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            Create your first job posting to start receiving applications from qualified candidates.
          </p>
          <Link
            href="/employer/jobs/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Applicants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Posted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Expires</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {jobs.map((job) => {
                  const status = getStatusBadge(job);
                  return (
                    <tr key={job.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <Link href={`/employer/jobs/${job.id}`} className="group">
                          <p className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">
                            {job.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {job.department && `${job.department} • `}
                            {job.locationType && `${job.locationType} • `}
                            {job.location || 'No location'}
                          </p>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900 font-medium">{job.applicationsCount}</p>
                        {job.applicationsCount > 0 && (
                          <Link
                            href={`/employer/jobs/${job.id}/applications`}
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            View all
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatRelativeDate(job.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {job.expiresAt ? formatDate(job.expiresAt) : 'No deadline'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/employer/jobs/${job.id}/edit`}
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(job.id, job.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              job.isActive
                                ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={job.isActive ? 'Close job' : 'Reopen job'}
                          >
                            {job.isActive ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-200">
            {jobs.map((job) => {
              const status = getStatusBadge(job);
              return (
                <div key={job.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/employer/jobs/${job.id}`}>
                      <h3 className="font-medium text-slate-900">{job.title}</h3>
                    </Link>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">
                    {job.department && `${job.department} • `}
                    {job.location || 'Remote'}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      <strong>{job.applicationsCount}</strong> applicant{job.applicationsCount !== 1 ? 's' : ''}
                    </span>
                    <span className="text-slate-400">Posted {formatRelativeDate(job.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <Link
                      href={`/employer/jobs/${job.id}/applications`}
                      className="flex-1 px-3 py-2 bg-primary-50 text-primary-600 text-sm font-medium rounded-lg text-center hover:bg-primary-100 transition-colors"
                    >
                      View Applicants
                    </Link>
                    <Link
                      href={`/employer/jobs/${job.id}/edit`}
                      className="px-3 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Total Jobs</p>
            <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Active</p>
            <p className="text-2xl font-bold text-emerald-600">
              {jobs.filter(j => j.isActive && (!j.expiresAt || new Date(j.expiresAt) >= new Date())).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Total Applicants</p>
            <p className="text-2xl font-bold text-primary-600">
              {jobs.reduce((sum, j) => sum + j.applicationsCount, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Avg per Job</p>
            <p className="text-2xl font-bold text-slate-900">
              {jobs.length > 0 ? Math.round(jobs.reduce((sum, j) => sum + j.applicationsCount, 0) / jobs.length) : 0}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
