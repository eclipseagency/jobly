'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { employerAPI } from '@/lib/api';

interface DashboardData {
  stats: {
    activeJobs: number;
    totalApplications: number;
    interviewsScheduled: number;
    positionsFilled: number;
  };
  recentApplications: Array<{
    id: string;
    name: string;
    position: string;
    date: string;
    status: string;
    avatar: string;
  }>;
  activeJobs: Array<{
    id: string;
    title: string;
    applicants: number;
    newApplicants: number;
    deadline: string;
  }>;
}

export default function EmployerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [jobs, applicants] = await Promise.all([
          employerAPI.getJobPostings(),
          employerAPI.getApplicants(),
        ]);

        const activeJobsList = jobs.filter(j => j.status === 'Active');

        setData({
          stats: {
            activeJobs: activeJobsList.length,
            totalApplications: applicants.length,
            interviewsScheduled: applicants.filter(a => a.status === 'Interview').length,
            positionsFilled: applicants.filter(a => a.status === 'Hired').length,
          },
          recentApplications: applicants.slice(0, 5).map(app => ({
            id: app.id,
            name: app.name,
            position: app.title,
            date: app.appliedAt,
            status: app.status,
            avatar: app.name.split(' ').map(n => n[0]).join('').toUpperCase(),
          })),
          activeJobs: activeJobsList.slice(0, 5).map(job => ({
            id: job.id,
            title: job.title,
            applicants: job.applicants,
            newApplicants: 0, // Would come from API
            deadline: job.expires,
          })),
        });
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        setData({
          stats: { activeJobs: 0, totalApplications: 0, interviewsScheduled: 0, positionsFilled: 0 },
          recentApplications: [],
          activeJobs: [],
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-slate-200 rounded mb-8"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-slate-200 rounded-xl"></div>
            <div className="h-80 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = data && data.stats.activeJobs === 0 && data.stats.totalApplications === 0;
  const stats = [
    { label: 'Active Jobs', value: data?.stats.activeJobs || 0, icon: '💼', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Applications', value: data?.stats.totalApplications || 0, icon: '📄', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Interviews Scheduled', value: data?.stats.interviewsScheduled || 0, icon: '📅', color: 'bg-purple-50 text-purple-600' },
    { label: 'Positions Filled', value: data?.stats.positionsFilled || 0, icon: '✅', color: 'bg-amber-50 text-amber-600' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Reviewed': return 'bg-slate-100 text-slate-600';
      case 'Interview': return 'bg-purple-100 text-purple-700';
      case 'Shortlisted': return 'bg-emerald-100 text-emerald-700';
      case 'Hired': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Employer Dashboard</h1>
        <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your job postings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${stat.color}`}>
                {stat.icon}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {isEmpty ? (
        /* Empty State - Get Started */
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Start Hiring</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Post your first job and start receiving applications from qualified candidates.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/employer/jobs/new"
              className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Post a Job
            </Link>
            <Link
              href="/employer/company"
              className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Complete Company Profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900">Recent Applications</h2>
              <Link href="/employer/applicants" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </Link>
            </div>
            {data?.recentApplications.length === 0 ? (
              <div className="py-8 text-center">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-slate-500">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium">
                      {app.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{app.name}</p>
                      <p className="text-sm text-slate-500 truncate">{app.position}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">{app.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Job Postings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900">Active Job Postings</h2>
              <Link href="/employer/jobs" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Manage jobs
              </Link>
            </div>
            {data?.activeJobs.length === 0 ? (
              <div className="py-8 text-center">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-500 mb-3">No active jobs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.activeJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{job.title}</p>
                      <p className="text-xs text-slate-500">Deadline: {job.deadline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">{job.applicants} applicants</p>
                      {job.newApplicants > 0 && (
                        <p className="text-xs text-primary-600">{job.newApplicants} new</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/employer/jobs/new"
              className="w-full mt-4 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post New Job
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions - Always show */}
      <div className="mt-6 bg-gradient-to-r from-primary-500 via-cyan-500 to-emerald-500 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Ready to find your next hire?</h3>
            <p className="text-white/80 text-sm mt-1">Post a job and reach thousands of qualified candidates in the Philippines</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/employer/jobs/new"
              className="px-4 py-2 bg-white text-primary-600 text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
            >
              Post a Job
            </Link>
            <Link
              href="/employer/applicants"
              className="px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/30 transition-colors"
            >
              View Applicants
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
