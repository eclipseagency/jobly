'use client';

import Link from 'next/link';

const stats = [
  { label: 'Applications', value: '24', change: '+3 this week', icon: '📄', color: 'bg-blue-500' },
  { label: 'Interviews', value: '5', change: '2 upcoming', icon: '📅', color: 'bg-green-500' },
  { label: 'Saved Jobs', value: '18', change: '+5 new matches', icon: '⭐', color: 'bg-yellow-500' },
  { label: 'Profile Views', value: '142', change: '+28% this month', icon: '👁️', color: 'bg-purple-500' },
];

const recentApplications = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechFlow Solutions',
    status: 'In Review',
    statusColor: 'bg-blue-100 text-blue-700',
    appliedAt: '2 days ago',
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartUp Hub PH',
    status: 'Interview Scheduled',
    statusColor: 'bg-green-100 text-green-700',
    appliedAt: '5 days ago',
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    company: 'Creative Minds Agency',
    status: 'Application Sent',
    statusColor: 'bg-slate-100 text-slate-700',
    appliedAt: '1 week ago',
  },
];

const recommendedJobs = [
  {
    id: '1',
    title: 'React Developer',
    company: 'Digital Ventures',
    location: 'Makati',
    salary: '₱100k - ₱150k',
    match: '95%',
  },
  {
    id: '2',
    title: 'Frontend Engineer',
    company: 'Tech Giants PH',
    location: 'Remote',
    salary: '₱120k - ₱180k',
    match: '90%',
  },
  {
    id: '3',
    title: 'UI Developer',
    company: 'App Masters',
    location: 'BGC, Taguig',
    salary: '₱80k - ₱120k',
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
    date: 'Dec 28, 2024',
    time: '10:00 AM',
    type: 'On-site',
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
          Welcome back, Alex! 👋
        </h1>
        <p className="text-slate-600">
          Here&apos;s what&apos;s happening with your job search today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-sm font-medium text-slate-500">{stat.label}</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{stat.value}</p>
            <p className="text-xs sm:text-sm text-slate-500">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Recent Applications</h2>
            <Link href="/dashboard/applications" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                  {app.company.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-800 truncate">{app.title}</h3>
                  <p className="text-sm text-slate-500">{app.company}</p>
                </div>
                <div className="flex items-center gap-3 sm:flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${app.statusColor}`}>
                    {app.status}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">{app.appliedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Upcoming Interviews</h2>
            <Link href="/dashboard/interviews" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingInterviews.map((interview) => (
              <div
                key={interview.id}
                className="p-4 border border-slate-200 rounded-xl hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
              >
                <h3 className="font-medium text-slate-800 mb-1">{interview.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{interview.company}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-slate-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {interview.date}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {interview.time}
                  </span>
                </div>
                <span className="inline-block mt-3 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                  {interview.type}
                </span>
              </div>
            ))}
            {upcomingInterviews.length === 0 && (
              <p className="text-center text-slate-500 py-8">No upcoming interviews</p>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="mt-8 bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Recommended for You</h2>
            <p className="text-sm text-slate-500">Based on your profile and preferences</p>
          </div>
          <Link href="/dashboard/jobs" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all jobs
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedJobs.map((job) => (
            <div
              key={job.id}
              className="p-4 border border-slate-200 rounded-xl hover:border-primary-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600 font-bold text-sm">
                  {job.company.substring(0, 2).toUpperCase()}
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  {job.match} Match
                </span>
              </div>
              <h3 className="font-semibold text-slate-800 group-hover:text-primary-600 transition-colors mb-1">
                {job.title}
              </h3>
              <p className="text-sm text-slate-500 mb-2">{job.company}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{job.location}</span>
                <span className="font-medium text-slate-700">{job.salary}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Completion */}
      <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Complete your profile</h2>
            <p className="text-primary-100 text-sm">
              A complete profile increases your chances of getting hired by 40%
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 sm:w-32">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-primary-100">Progress</span>
                <span className="font-semibold">75%</span>
              </div>
              <div className="h-2 bg-primary-800 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              className="px-4 py-2 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
            >
              Complete
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
