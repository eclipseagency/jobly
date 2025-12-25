'use client';

import Link from 'next/link';

const stats = [
  { label: 'Applications', value: '24', change: '+3 this week' },
  { label: 'Interviews', value: '5', change: '2 upcoming' },
  { label: 'Saved Jobs', value: '18', change: '+5 new matches' },
  { label: 'Profile Views', value: '142', change: '+28% this month' },
];

const recentApplications = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechFlow Solutions',
    status: 'In Review',
    statusColor: 'bg-blue-50 text-blue-600',
    appliedAt: '2 days ago',
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartUp Hub PH',
    status: 'Interview',
    statusColor: 'bg-green-50 text-green-600',
    appliedAt: '5 days ago',
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    company: 'Creative Minds Agency',
    status: 'Applied',
    statusColor: 'bg-slate-100 text-slate-600',
    appliedAt: '1 week ago',
  },
];

const recommendedJobs = [
  {
    id: '1',
    title: 'React Developer',
    company: 'Digital Ventures',
    location: 'Makati',
    salary: '100k - 150k',
    match: '95%',
  },
  {
    id: '2',
    title: 'Frontend Engineer',
    company: 'Tech Giants PH',
    location: 'Remote',
    salary: '120k - 180k',
    match: '90%',
  },
  {
    id: '3',
    title: 'UI Developer',
    company: 'App Masters',
    location: 'BGC, Taguig',
    salary: '80k - 120k',
    match: '88%',
  },
];

const upcomingInterviews = [
  {
    id: '1',
    title: 'Full Stack Developer',
    company: 'StartUp Hub PH',
    date: 'Tomorrow',
    time: '2:00 PM',
    type: 'Video Call',
  },
  {
    id: '2',
    title: 'Senior Developer',
    company: 'Tech Corp',
    date: 'Dec 28',
    time: '10:00 AM',
    type: 'On-site',
  },
];

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, Alex
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s what&apos;s happening with your job search.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-slate-200 p-5"
          >
            <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Applications</h2>
            <Link href="/dashboard/applications" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentApplications.map((app) => (
              <div key={app.id} className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm flex-shrink-0">
                  {app.company.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">{app.title}</h3>
                  <p className="text-sm text-slate-500">{app.company}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${app.statusColor}`}>
                  {app.status}
                </span>
                <span className="text-xs text-slate-400 hidden sm:block">{app.appliedAt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Interviews</h2>
            <Link href="/dashboard/interviews" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {upcomingInterviews.map((interview) => (
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
        </div>
      </div>

      {/* Recommended Jobs */}
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
          {recommendedJobs.map((job) => (
            <div key={job.id} className="p-5 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-medium text-sm">
                  {job.company.substring(0, 2).toUpperCase()}
                </div>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded">
                  {job.match}
                </span>
              </div>
              <h3 className="font-medium text-slate-900 mb-1">{job.title}</h3>
              <p className="text-sm text-slate-500 mb-2">{job.company}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{job.location}</span>
                <span className="font-medium text-slate-700">{job.salary}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Completion */}
      <div className="mt-6 bg-primary-600 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white">Complete your profile</h2>
          <p className="text-primary-100 text-sm mt-0.5">
            Increase your chances of getting hired by 40%
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white text-sm">
            <span className="font-medium">75%</span>
            <div className="w-24 h-1.5 bg-primary-400 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
          <Link
            href="/dashboard/profile"
            className="px-4 py-2 bg-white text-primary-600 font-medium text-sm rounded-lg hover:bg-primary-50 transition-colors"
          >
            Complete
          </Link>
        </div>
      </div>
    </div>
  );
}
