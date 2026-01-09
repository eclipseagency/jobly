'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface JobPerformance {
  id: string;
  title: string;
  isActive: boolean;
  applications: number;
  interviewed: number;
  offered: number;
  hired: number;
  conversionRate: number;
}

interface AnalyticsData {
  summary: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    interviewRate: number;
    offerRate: number;
    hireRate: number;
    avgApplicationsPerJob: number;
  };
  jobPerformance: JobPerformance[];
  applicationTrend: Array<{ date: string; count: number }>;
  statusBreakdown: {
    new: number;
    reviewing: number;
    shortlisted: number;
    interviewed: number;
    offered: number;
    hired: number;
    rejected: number;
  };
  timeRange: string;
}

export default function EmployerAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/employer/analytics?timeRange=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const hasData = analytics && (
    analytics.summary.totalApplications > 0 ||
    analytics.summary.totalJobs > 0
  );

  // Calculate max for trend chart
  const maxTrend = analytics?.applicationTrend
    ? Math.max(...analytics.applicationTrend.map(t => t.count), 1)
    : 1;

  // Status colors
  const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    reviewing: 'bg-yellow-500',
    shortlisted: 'bg-purple-500',
    interviewed: 'bg-cyan-500',
    offered: 'bg-green-500',
    hired: 'bg-emerald-600',
    rejected: 'bg-red-400',
  };

  const statusLabels: Record<string, string> = {
    new: 'New',
    reviewing: 'Reviewing',
    shortlisted: 'Shortlisted',
    interviewed: 'Interviewed',
    offered: 'Offered',
    hired: 'Hired',
    rejected: 'Rejected',
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-slate-200 rounded mb-8"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded-xl"></div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600 mt-1">Track your hiring performance and job metrics</p>
        </div>
        <div className="flex gap-2">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
          ].map(range => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                timeRange === range.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        // Empty State
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Analytics Yet</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Start posting jobs to see your hiring analytics. Once candidates apply to your jobs, you&apos;ll see metrics here.
          </p>
          <Link
            href="/employer/jobs/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post Your First Job
          </Link>
        </div>
      ) : analytics && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Active Jobs</p>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {analytics.summary.activeJobs}
                <span className="text-sm font-normal text-slate-500 ml-1">/ {analytics.summary.totalJobs}</span>
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Applications</p>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mt-2">{analytics.summary.totalApplications}</p>
              <p className="text-xs text-slate-500 mt-1">
                ~{analytics.summary.avgApplicationsPerJob} per job
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Interview Rate</p>
                <div className="p-2 bg-cyan-50 rounded-lg">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mt-2">{analytics.summary.interviewRate}%</p>
              <p className="text-xs text-slate-500 mt-1">of applicants interviewed</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Hire Rate</p>
                <div className="p-2 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mt-2">{analytics.summary.hireRate}%</p>
              <p className="text-xs text-slate-500 mt-1">of applicants hired</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Application Trend */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Application Trend</h3>
              {analytics.applicationTrend.length > 0 ? (
                <div className="h-48 flex items-end gap-1">
                  {analytics.applicationTrend.slice(-14).map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                        style={{ height: `${(day.count / maxTrend) * 100}%`, minHeight: day.count > 0 ? '8px' : '2px' }}
                        title={`${day.date}: ${day.count} applications`}
                      />
                      <span className="text-[10px] text-slate-400 -rotate-45 origin-left whitespace-nowrap">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                  No application data for this period
                </div>
              )}
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Application Status</h3>
              <div className="space-y-3">
                {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
                  const total = analytics.summary.totalApplications || 1;
                  const percentage = Math.round((count / total) * 100);
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className="w-20 text-sm text-slate-600">{statusLabels[status]}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${statusColors[status]} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-slate-600 text-right">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Job Performance Table */}
          {analytics.jobPerformance.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Job Performance</h2>
                <Link
                  href="/employer/dashboard/jobs"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View All Jobs →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Job Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Applications</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Interviewed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Offered</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hired</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analytics.jobPerformance.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <Link
                            href={`/employer/jobs/${job.id}`}
                            className="font-medium text-slate-900 hover:text-primary-600"
                          >
                            {job.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            job.isActive
                              ? 'bg-green-50 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {job.isActive ? 'Active' : 'Closed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{job.applications}</td>
                        <td className="px-6 py-4 text-slate-600">{job.interviewed}</td>
                        <td className="px-6 py-4 text-slate-600">{job.offered}</td>
                        <td className="px-6 py-4">
                          {job.hired > 0 ? (
                            <span className="px-2 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                              {job.hired}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5">
                              <div
                                className={`h-full rounded-full ${
                                  job.conversionRate > 20 ? 'bg-green-500' :
                                  job.conversionRate > 10 ? 'bg-yellow-500' : 'bg-slate-300'
                                }`}
                                style={{ width: `${Math.min(job.conversionRate, 100)}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${
                              job.conversionRate > 20 ? 'text-green-600' : 'text-slate-600'
                            }`}>
                              {job.conversionRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Tips for Better Results</h3>
            <p className="text-white/80 mt-1">
              Write clear job titles, include salary ranges, and respond quickly to applications to improve your conversion rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
