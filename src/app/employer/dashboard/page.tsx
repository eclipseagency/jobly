'use client';

import Link from 'next/link';

const stats = [
  { label: 'Active Jobs', value: '5', change: '+2 this month', icon: '💼', color: 'bg-blue-50 text-blue-600' },
  { label: 'Total Applications', value: '124', change: '+18 this week', icon: '📄', color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Interviews Scheduled', value: '8', change: '3 this week', icon: '📅', color: 'bg-purple-50 text-purple-600' },
  { label: 'Positions Filled', value: '12', change: 'This year', icon: '✅', color: 'bg-amber-50 text-amber-600' },
];

const recentApplications = [
  { id: 1, name: 'Maria Santos', position: 'Senior Frontend Developer', date: '2 hours ago', status: 'New', avatar: 'MS' },
  { id: 2, name: 'John Cruz', position: 'Backend Engineer', date: '5 hours ago', status: 'Reviewed', avatar: 'JC' },
  { id: 3, name: 'Ana Reyes', position: 'UI/UX Designer', date: '1 day ago', status: 'Interview', avatar: 'AR' },
  { id: 4, name: 'Miguel Torres', position: 'Senior Frontend Developer', date: '1 day ago', status: 'New', avatar: 'MT' },
  { id: 5, name: 'Sofia Garcia', position: 'DevOps Engineer', date: '2 days ago', status: 'Shortlisted', avatar: 'SG' },
];

const activeJobs = [
  { id: 1, title: 'Senior Frontend Developer', applicants: 45, new: 12, deadline: 'Dec 30, 2024' },
  { id: 2, title: 'Backend Engineer', applicants: 32, new: 5, deadline: 'Jan 5, 2025' },
  { id: 3, title: 'UI/UX Designer', applicants: 28, new: 8, deadline: 'Jan 10, 2025' },
  { id: 4, title: 'DevOps Engineer', applicants: 15, new: 3, deadline: 'Jan 15, 2025' },
  { id: 5, title: 'Product Manager', applicants: 22, new: 6, deadline: 'Jan 20, 2025' },
];

export default function EmployerDashboard() {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, Tech Solutions!</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your job postings</p>
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
            <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">Recent Applications</h2>
            <Link href="/employer/dashboard/applicants" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium">
                  {app.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{app.name}</p>
                  <p className="text-sm text-slate-500 truncate">{app.position}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    app.status === 'New' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'Reviewed' ? 'bg-slate-100 text-slate-600' :
                    app.status === 'Interview' ? 'bg-purple-100 text-purple-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {app.status}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{app.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Job Postings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">Active Job Postings</h2>
            <Link href="/employer/dashboard/jobs" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Manage jobs
            </Link>
          </div>
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{job.title}</p>
                  <p className="text-xs text-slate-500">Deadline: {job.deadline}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{job.applicants} applicants</p>
                  {job.new > 0 && (
                    <p className="text-xs text-primary-600">{job.new} new</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post New Job
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gradient-to-r from-primary-500 via-cyan-500 to-emerald-500 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Ready to find your next hire?</h3>
            <p className="text-white/80 text-sm mt-1">Post a job and reach thousands of qualified candidates in the Philippines</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white text-primary-600 text-sm font-medium rounded-lg hover:bg-white/90 transition-colors">
              Post a Job
            </button>
            <button className="px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/30 transition-colors">
              Search Candidates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
