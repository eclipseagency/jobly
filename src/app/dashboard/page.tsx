'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { jobSeekerAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardData {
  stats: {
    applications: number;
    interviews: number;
    savedJobs: number;
    profileViews: number;
  };
  recentApplications: Array<{
    id: string;
    title: string;
    company: string;
    status: string;
    statusColor: string;
    appliedAt: string;
  }>;
  upcomingInterviews: Array<{
    id: string;
    title: string;
    company: string;
    date: string;
    time: string;
    type: string;
  }>;
  recommendedJobs: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
  }>;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'in_review':
    case 'in review':
      return 'bg-blue-50 text-blue-600';
    case 'interview':
      return 'bg-green-50 text-green-600';
    case 'offer':
      return 'bg-emerald-50 text-emerald-600';
    case 'rejected':
      return 'bg-red-50 text-red-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

// Profile completion calculation
interface ProfileField {
  key: string;
  label: string;
  weight: number;
  required: boolean;
}

const PROFILE_FIELDS: ProfileField[] = [
  { key: 'name', label: 'Full Name', weight: 15, required: true },
  { key: 'email', label: 'Email', weight: 15, required: true },
  { key: 'phone', label: 'Phone Number', weight: 10, required: false },
  { key: 'location', label: 'Location', weight: 10, required: false },
  { key: 'headline', label: 'Professional Headline', weight: 10, required: false },
  { key: 'summary', label: 'Summary', weight: 10, required: false },
  { key: 'experience', label: 'Work Experience', weight: 10, required: false },
  { key: 'skills', label: 'Skills', weight: 10, required: false },
  { key: 'resumeUrl', label: 'Resume', weight: 10, required: false },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate profile completion
  const profileCompletion = useMemo(() => {
    if (!user) return { percentage: 0, completedFields: [], missingFields: PROFILE_FIELDS };

    let totalWeight = 0;
    const completedFields: ProfileField[] = [];
    const missingFields: ProfileField[] = [];

    for (const field of PROFILE_FIELDS) {
      const value = user[field.key as keyof typeof user];
      const isComplete = Array.isArray(value) ? value.length > 0 : Boolean(value);

      if (isComplete) {
        totalWeight += field.weight;
        completedFields.push(field);
      } else {
        missingFields.push(field);
      }
    }

    return { percentage: totalWeight, completedFields, missingFields };
  }, [user]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Fetch data from API
        const [applications, interviews, savedJobs, jobs] = await Promise.all([
          jobSeekerAPI.getApplications(),
          jobSeekerAPI.getInterviews(),
          jobSeekerAPI.getSavedJobs(),
          jobSeekerAPI.getJobs(),
        ]);

        setData({
          stats: {
            applications: applications.length,
            interviews: interviews.filter(i => i.status === 'upcoming').length,
            savedJobs: savedJobs.length,
            profileViews: 0,
          },
          recentApplications: applications.slice(0, 3).map(app => ({
            id: app.id,
            title: app.title,
            company: app.company,
            status: app.statusLabel,
            statusColor: getStatusColor(app.status),
            appliedAt: app.appliedAt,
          })),
          upcomingInterviews: interviews.filter(i => i.status === 'upcoming').slice(0, 2).map(i => ({
            id: i.id,
            title: i.title,
            company: i.company,
            date: i.date,
            time: i.time,
            type: i.type === 'video' ? 'Video Call' : i.type === 'onsite' ? 'On-site' : 'Phone',
          })),
          recommendedJobs: jobs.slice(0, 3).map(job => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: `₱${(job.salaryMin/1000).toFixed(0)}k - ${(job.salaryMax/1000).toFixed(0)}k`,
          })),
        });
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        // Set empty state on error
        setData({
          stats: { applications: 0, interviews: 0, savedJobs: 0, profileViews: 0 },
          recentApplications: [],
          upcomingInterviews: [],
          recommendedJobs: [],
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-slate-200 rounded mb-8"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-slate-200 rounded-lg"></div>
            <div className="h-64 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = data && data.stats.applications === 0 && data.stats.savedJobs === 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s what&apos;s happening with your job search.
        </p>
      </div>

      {/* Profile Completion Card - Show prominently at top */}
      {profileCompletion.percentage < 100 && (
        <div className="mb-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h2 className="font-semibold text-lg">Complete Your Profile</h2>
              </div>
              <p className="text-primary-100 text-sm mb-4">
                Profiles with more details get 3x more views from employers.
                {profileCompletion.missingFields.length > 0 && (
                  <span className="block mt-1">
                    Add your {profileCompletion.missingFields.slice(0, 2).map(f => f.label.toLowerCase()).join(' and ')} to stand out.
                  </span>
                )}
              </p>

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-primary-400/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletion.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold whitespace-nowrap">
                  {profileCompletion.percentage}% complete
                </span>
              </div>
            </div>

            <Link
              href="/dashboard/profile"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Update Profile
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Applications', value: data?.stats.applications || 0, href: '/dashboard/applications' },
          { label: 'Interviews', value: data?.stats.interviews || 0, href: '/dashboard/interviews' },
          { label: 'Saved Jobs', value: data?.stats.savedJobs || 0, href: '/dashboard/jobs' },
          { label: 'Profile Views', value: data?.stats.profileViews || 0, href: '/dashboard/profile' },
        ].map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className="bg-white rounded-lg border border-slate-200 p-5 hover:border-primary-200 hover:shadow-sm transition-all"
          >
            <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
          </Link>
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
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Start Your Job Search</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Complete your profile and start applying to jobs that match your skills and experience.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/dashboard/profile"
              className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Complete Profile
            </Link>
            <Link
              href="/dashboard/jobs"
              className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Applications */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Recent Applications</h2>
                <Link href="/dashboard/applications" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </div>
              {data?.recentApplications.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-500 mb-2">No applications yet</p>
                  <Link href="/dashboard/jobs" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Browse jobs →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data?.recentApplications.map((app) => (
                    <Link key={app.id} href={`/dashboard/applications/${app.id}`} className="p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors block">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm flex-shrink-0">
                        {app.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 truncate">{app.title}</h3>
                        <p className="text-sm text-slate-500 mb-2">{app.company}</p>
                        {/* Status Timeline */}
                        <div className="flex items-center gap-1">
                          {['Applied', 'In Review', 'Interview', 'Offer'].map((step, idx) => {
                            const currentIdx = ['submitted', 'in_review', 'interview', 'offer'].indexOf(
                              app.status.toLowerCase().replace(' ', '_')
                            );
                            const isCompleted = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;
                            const isRejected = app.status.toLowerCase() === 'rejected';

                            return (
                              <div key={step} className="flex items-center">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    isRejected && idx <= 0
                                      ? 'bg-red-500'
                                      : isCompleted
                                      ? isCurrent
                                        ? 'bg-primary-600 ring-2 ring-primary-100'
                                        : 'bg-primary-600'
                                      : 'bg-slate-200'
                                  }`}
                                />
                                {idx < 3 && (
                                  <div
                                    className={`w-6 h-0.5 ${
                                      isCompleted && idx < currentIdx ? 'bg-primary-600' : 'bg-slate-200'
                                    }`}
                                  />
                                )}
                              </div>
                            );
                          })}
                          <span className={`ml-2 text-xs font-medium ${app.statusColor.replace('bg-', 'text-').replace('-50', '-600')}`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 hidden sm:block whitespace-nowrap">{app.appliedAt}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Interviews */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Interviews</h2>
                <Link href="/dashboard/interviews" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </div>
              {data?.upcomingInterviews.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-slate-500">No upcoming interviews</p>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {data?.upcomingInterviews.map((interview) => (
                    <div key={interview.id} className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-medium text-slate-900 text-sm">{interview.title}</h3>
                      <p className="text-sm text-slate-500 mb-3">{interview.company}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {interview.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {interview.time}
                        </span>
                      </div>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-white border border-slate-200 text-slate-600 text-xs rounded">
                        {interview.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommended Jobs */}
          {data && data.recommendedJobs.length > 0 && (
            <div className="mt-6 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div>
                  <h2 className="font-semibold text-slate-900">Recommended for You</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Based on your profile</p>
                </div>
                <Link href="/dashboard/jobs" className="text-sm text-primary-600 hover:text-primary-700">
                  View all jobs
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {data.recommendedJobs.map((job) => (
                  <Link key={job.id} href={`/dashboard/jobs?job=${job.id}`} className="p-5 hover:bg-slate-50 transition-colors block">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-medium text-sm">
                        {job.company.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">{job.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">{job.company}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{job.location}</span>
                      <span className="font-medium text-slate-700">{job.salary}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
