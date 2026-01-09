'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface SavedJob {
  id: string;
  savedAt: string;
  job: {
    id: string;
    title: string;
    description: string;
    location: string | null;
    locationType: string | null;
    salary: string | null;
    jobType: string | null;
    createdAt: string;
    isActive: boolean;
    company: {
      id: string;
      name: string;
      logo: string | null;
      isVerified: boolean;
    };
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function SavedJobsPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSavedJobs() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setError(null);
      try {
        const response = await fetch('/api/saved-jobs', {
          headers: {
            'x-user-id': user.id,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSavedJobs(data.savedJobs || []);
        } else {
          setError('Failed to load saved jobs. Please try refreshing the page.');
        }
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
        setError('Unable to connect. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchSavedJobs();
    }
  }, [user?.id, authLoading]);

  const handleRemove = async (savedJobId: string) => {
    if (!user?.id) return;

    setRemoving(savedJobId);
    try {
      const response = await fetch(`/api/saved-jobs/${savedJobId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id,
        },
      });

      if (response.ok) {
        setSavedJobs((prev) => prev.filter((sj) => sj.id !== savedJobId));
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || 'Failed to remove saved job. Please try again.');
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
      alert('Failed to remove saved job. Please check your connection and try again.');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
        <p className="text-slate-600 mt-1">
          Jobs you&apos;ve bookmarked for later
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-slate-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-3" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-slate-200 rounded w-20" />
                    <div className="h-6 bg-slate-200 rounded w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? null : savedJobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-slate-300 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <h3 className="font-semibold text-slate-900 mb-2">No saved jobs yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            When you find jobs you&apos;re interested in, save them here to apply later
          </p>
          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((savedJob) => (
            <div
              key={savedJob.id}
              className={`bg-white rounded-xl border border-slate-200 p-6 transition-all ${
                !savedJob.job.isActive ? 'opacity-60' : 'hover:border-primary-300 hover:shadow-md'
              }`}
            >
              <div className="flex gap-4">
                {/* Company Logo */}
                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-slate-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-lg flex-shrink-0">
                  {savedJob.job.company.logo ? (
                    <Image
                      src={savedJob.job.company.logo}
                      alt={savedJob.job.company.name}
                      width={56}
                      height={56}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    savedJob.job.company.name.substring(0, 2).toUpperCase()
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/jobs/${savedJob.job.id}`}
                        className="font-semibold text-slate-900 hover:text-primary-600 transition-colors"
                      >
                        {savedJob.job.title}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                        <span>{savedJob.job.company.name}</span>
                        {savedJob.job.company.isVerified && (
                          <svg
                            className="w-4 h-4 text-primary-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!savedJob.job.isActive && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                          Closed
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        Saved {formatDate(savedJob.savedAt)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                    {savedJob.job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {savedJob.job.location && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                        </svg>
                        {savedJob.job.location}
                      </span>
                    )}
                    {savedJob.job.jobType && (
                      <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full capitalize">
                        {savedJob.job.jobType}
                      </span>
                    )}
                    {savedJob.job.locationType && (
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full capitalize">
                        {savedJob.job.locationType}
                      </span>
                    )}
                    {savedJob.job.salary && (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                        {savedJob.job.salary}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                    {savedJob.job.isActive ? (
                      <>
                        <Link
                          href={`/jobs/${savedJob.job.id}`}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          View & Apply
                        </Link>
                        <button
                          onClick={() => handleRemove(savedJob.id)}
                          disabled={removing === savedJob.id}
                          className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          {removing === savedJob.id ? 'Removing...' : 'Remove'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRemove(savedJob.id)}
                        disabled={removing === savedJob.id}
                        className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {removing === savedJob.id ? 'Removing...' : 'Remove from Saved'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips Section */}
      {savedJobs.length > 0 && (
        <div className="mt-8 bg-primary-50 border border-primary-100 rounded-xl p-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-primary-900 mb-1">Pro Tip</h3>
              <p className="text-sm text-primary-700">
                Don&apos;t wait too long to apply! Popular positions can receive hundreds
                of applications. Apply early to increase your chances of getting noticed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
