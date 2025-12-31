'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface AnalyticsData {
  totalViews: number;
  totalApplications: number;
  interviewRate: number;
  hireRate: number;
  jobPerformance: Array<{
    title: string;
    views: number;
    applications: number;
    interviews: number;
    hires: number;
  }>;
}

const defaultAnalytics: AnalyticsData = {
  totalViews: 0,
  totalApplications: 0,
  interviewRate: 0,
  hireRate: 0,
  jobPerformance: [],
};

export default function EmployerAnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState<AnalyticsData>(defaultAnalytics);
  const [isLoading, setIsLoading] = useState(true);

  // Load analytics from localStorage (in production this would come from API)
  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`jobly_analytics_${user.id}`);
        if (saved) {
          setAnalytics(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    }
    setIsLoading(false);
  }, [user?.id]);

  const hasData = analytics.totalViews > 0 || analytics.totalApplications > 0 || analytics.jobPerformance.length > 0;

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
            Start posting jobs to see your hiring analytics. Once candidates view and apply to your jobs, you&apos;ll see metrics here.
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
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-600 mb-1">Total Views</p>
              <p className="text-3xl font-bold text-slate-900">{analytics.totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-600 mb-1">Total Applications</p>
              <p className="text-3xl font-bold text-slate-900">{analytics.totalApplications}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-600 mb-1">Interview Rate</p>
              <p className="text-3xl font-bold text-slate-900">{analytics.interviewRate}%</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-600 mb-1">Hire Rate</p>
              <p className="text-3xl font-bold text-slate-900">{analytics.hireRate}%</p>
            </div>
          </div>

          {/* Job Performance Table */}
          {analytics.jobPerformance.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Job Performance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Job Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Applications</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Interviews</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hires</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analytics.jobPerformance.map((job, i) => {
                      const conversion = job.views > 0 ? ((job.applications / job.views) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">{job.title}</td>
                          <td className="px-6 py-4 text-slate-600">{job.views.toLocaleString()}</td>
                          <td className="px-6 py-4 text-slate-600">{job.applications}</td>
                          <td className="px-6 py-4 text-slate-600">{job.interviews}</td>
                          <td className="px-6 py-4">
                            {job.hires > 0 ? (
                              <span className="px-2 py-1 bg-green-50 text-green-700 text-sm rounded-full">{job.hires}</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-medium ${parseFloat(conversion) > 3 ? 'text-green-600' : 'text-slate-600'}`}>
                              {conversion}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
