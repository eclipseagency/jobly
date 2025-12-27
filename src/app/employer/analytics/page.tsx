'use client';

import { useState } from 'react';

const overviewStats = [
  { label: 'Total Views', value: '12,450', change: '+18%', trend: 'up' },
  { label: 'Total Applications', value: '342', change: '+24%', trend: 'up' },
  { label: 'Interview Rate', value: '32%', change: '+5%', trend: 'up' },
  { label: 'Hire Rate', value: '12%', change: '-2%', trend: 'down' },
];

const jobPerformance = [
  { title: 'Senior Frontend Developer', views: 1240, applications: 45, interviews: 12, hires: 1 },
  { title: 'Full Stack Engineer', views: 980, applications: 38, interviews: 8, hires: 2 },
  { title: 'Product Designer', views: 756, applications: 29, interviews: 6, hires: 1 },
  { title: 'DevOps Engineer', views: 543, applications: 22, interviews: 5, hires: 0 },
  { title: 'Technical Project Manager', views: 432, applications: 18, interviews: 4, hires: 1 },
];

const applicationSources = [
  { source: 'Direct Search', count: 145, percentage: 42 },
  { source: 'Company Profile', count: 89, percentage: 26 },
  { source: 'Job Alerts', count: 62, percentage: 18 },
  { source: 'Social Media', count: 31, percentage: 9 },
  { source: 'Referrals', count: 15, percentage: 5 },
];

const weeklyData = [
  { day: 'Mon', views: 180, applications: 12 },
  { day: 'Tue', views: 220, applications: 18 },
  { day: 'Wed', views: 190, applications: 14 },
  { day: 'Thu', views: 240, applications: 22 },
  { day: 'Fri', views: 210, applications: 16 },
  { day: 'Sat', views: 120, applications: 8 },
  { day: 'Sun', views: 90, applications: 5 },
];

export default function EmployerAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

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

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {overviewStats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className={`text-sm mt-1 flex items-center gap-1 ${
              stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.trend === 'up' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {stat.change} vs last period
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-6">Weekly Performance</h2>
          <div className="h-64 flex items-end justify-between gap-4">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary-100 rounded-t"
                    style={{ height: `${(day.views / 250) * 180}px` }}
                  >
                    <div
                      className="w-full bg-primary-500 rounded-t"
                      style={{ height: `${(day.applications / day.views) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-500">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-100 rounded"></div>
              <span className="text-sm text-slate-600">Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded"></div>
              <span className="text-sm text-slate-600">Applications</span>
            </div>
          </div>
        </div>

        {/* Application Sources */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-6">Application Sources</h2>
          <div className="space-y-4">
            {applicationSources.map((source, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">{source.source}</span>
                  <span className="text-sm font-medium text-slate-900">{source.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Performance Table */}
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
              {jobPerformance.map((job, i) => {
                const conversion = ((job.applications / job.views) * 100).toFixed(1);
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

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Improve Your Hiring</h3>
            <p className="text-white/80 mt-1">
              Your Senior Frontend Developer position has a great conversion rate! Consider using similar keywords and job descriptions for other technical roles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
