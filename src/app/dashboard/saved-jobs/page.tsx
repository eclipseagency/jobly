'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { jobs, formatSalary, getSavedJobs, toggleSavedJob, type Job } from '@/lib/jobs-data';

export default function SavedJobsPage() {
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ids = getSavedJobs();
    setSavedJobIds(ids);
    const savedJobsList = jobs.filter(job => ids.includes(job.id));
    setSavedJobs(savedJobsList);
    setIsLoading(false);
  }, []);

  const handleRemoveSaved = (jobId: string) => {
    const result = toggleSavedJob(jobId);
    setSavedJobIds(result.saved);
    setSavedJobs(jobs.filter(job => result.saved.includes(job.id)));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading saved jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/">
                <Image src="/logo.svg" alt="Jobly" width={90} height={25} priority />
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard/jobs" className="text-sm font-medium text-slate-600 hover:text-slate-900">Find Jobs</Link>
                <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">Dashboard</Link>
                <Link href="/dashboard/applications" className="text-sm font-medium text-slate-600 hover:text-slate-900">Applications</Link>
                <Link href="/dashboard/saved-jobs" className="text-sm font-medium text-primary-600">Saved Jobs</Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/profile" className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                JS
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
          <p className="text-slate-600 mt-1">
            {savedJobs.length === 0
              ? "You haven't saved any jobs yet"
              : `You have ${savedJobs.length} saved job${savedJobs.length === 1 ? '' : 's'}`
            }
          </p>
        </div>

        {savedJobs.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No Saved Jobs</h2>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              When you find jobs you&apos;re interested in, save them here to apply later.
            </p>
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Jobs
            </Link>
          </div>
        ) : (
          /* Saved Jobs List */
          <div className="space-y-4">
            {savedJobs.map((job) => (
              <article
                key={job.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div className="flex gap-4">
                  {/* Company Logo */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-slate-100 border border-slate-200 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                    {job.companyLogo}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <Link href={`/jobs/${job.id}`} className="font-semibold text-slate-900 hover:text-primary-600 transition-colors">
                          {job.title}
                        </Link>
                        <p className="text-sm text-slate-600 mt-0.5">{job.company}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{job.posted}</span>
                        <span>•</span>
                        <span>{job.applicants} applicants</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                        </svg>
                        {job.workSetup}
                      </span>
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

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <span className="text-sm font-semibold text-green-600">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemoveSaved(job.id)}
                          className="p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove from saved"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          View & Apply
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {savedJobs.length > 0 && (
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{savedJobs.length}</p>
                  <p className="text-sm text-slate-500">Saved Jobs</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    ₱{Math.round(savedJobs.reduce((sum, job) => sum + (job.salaryMin + job.salaryMax) / 2, 0) / savedJobs.length / 1000)}k
                  </p>
                  <p className="text-sm text-slate-500">Avg. Salary</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {savedJobs.filter(job => job.workSetup === 'Remote').length}
                  </p>
                  <p className="text-sm text-slate-500">Remote Jobs</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
