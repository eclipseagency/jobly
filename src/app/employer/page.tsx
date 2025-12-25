'use client';

import Link from 'next/link';

const stats = [
  { label: 'Active Jobs', value: '8', change: '+2 this week', trend: 'up' },
  { label: 'Total Applicants', value: '156', change: '+23 this week', trend: 'up' },
  { label: 'Interviews Scheduled', value: '12', change: '3 today', trend: 'neutral' },
  { label: 'Hires This Month', value: '4', change: '+1 from last month', trend: 'up' },
];

const recentApplicants = [
  { id: 1, name: 'Maria Santos', role: 'Senior Frontend Developer', avatar: 'MS', appliedAt: '2 hours ago', status: 'New' },
  { id: 2, name: 'John Reyes', role: 'Full Stack Engineer', avatar: 'JR', appliedAt: '5 hours ago', status: 'Reviewed' },
  { id: 3, name: 'Ana Cruz', role: 'Product Designer', avatar: 'AC', appliedAt: '1 day ago', status: 'Interview' },
  { id: 4, name: 'Miguel Lopez', role: 'DevOps Engineer', avatar: 'ML', appliedAt: '1 day ago', status: 'New' },
  { id: 5, name: 'Sarah Garcia', role: 'Senior Frontend Developer', avatar: 'SG', appliedAt: '2 days ago', status: 'Shortlisted' },
];

const activeJobs = [
  { id: 1, title: 'Senior Frontend Developer', applicants: 45, newApplicants: 8, views: 1240, posted: '5 days ago', status: 'Active' },
  { id: 2, title: 'Full Stack Engineer', applicants: 38, newApplicants: 5, views: 980, posted: '1 week ago', status: 'Active' },
  { id: 3, title: 'Product Designer', applicants: 29, newApplicants: 3, views: 756, posted: '1 week ago', status: 'Active' },
  { id: 4, title: 'DevOps Engineer', applicants: 22, newApplicants: 4, views: 543, posted: '2 weeks ago', status: 'Active' },
];

const upcomingInterviews = [
  { id: 1, candidate: 'Ana Cruz', role: 'Product Designer', time: 'Today, 2:00 PM', type: 'Video Call' },
  { id: 2, candidate: 'John Reyes', role: 'Full Stack Engineer', time: 'Today, 4:30 PM', type: 'Technical' },
  { id: 3, candidate: 'Sarah Garcia', role: 'Senior Frontend Developer', time: 'Tomorrow, 10:00 AM', type: 'Final Round' },
];

export default function EmployerDashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, TechCorp</h1>
          <p className="text-slate-600 mt-1">Here&apos;s what&apos;s happening with your job postings.</p>
        </div>
        <Link
          href="/employer/jobs/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Post New Job
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className={`text-sm mt-1 flex items-center gap-1 ${
              stat.trend === 'up' ? 'text-green-600' : 'text-slate-500'
            }`}>
              {stat.trend === 'up' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applicants */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Applicants</h2>
            <Link href="/employer/applicants" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentApplicants.map((applicant) => (
              <div key={applicant.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-medium text-sm">
                  {applicant.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{applicant.name}</p>
                  <p className="text-sm text-slate-500 truncate">{applicant.role}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                    applicant.status === 'New' ? 'bg-blue-50 text-blue-700' :
                    applicant.status === 'Reviewed' ? 'bg-slate-100 text-slate-700' :
                    applicant.status === 'Interview' ? 'bg-purple-50 text-purple-700' :
                    applicant.status === 'Shortlisted' ? 'bg-green-50 text-green-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {applicant.status}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{applicant.appliedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Upcoming Interviews</h2>
            <Link href="/employer/interviews" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingInterviews.map((interview) => (
              <div key={interview.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-slate-900">{interview.candidate}</p>
                  <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-medium">
                    {interview.type}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-1">{interview.role}</p>
                <p className="text-sm text-slate-900 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {interview.time}
                </p>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-slate-100">
            <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-2 rounded-lg hover:bg-primary-50 transition-colors">
              Schedule Interview
            </button>
          </div>
        </div>
      </div>

      {/* Active Job Postings */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Active Job Postings</h2>
          <Link href="/employer/jobs" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Manage all jobs
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Job Title</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Applicants</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Views</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Posted</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{job.title}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900">{job.applicants}</span>
                      {job.newApplicants > 0 && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          +{job.newApplicants} new
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{job.views.toLocaleString()}</td>
                  <td className="px-5 py-4 text-slate-600">{job.posted}</td>
                  <td className="px-5 py-4">
                    <span className="inline-block px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                      {job.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <Link
          href="/employer/jobs/new"
          className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-primary-200 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-slate-900">Post a New Job</p>
            <p className="text-sm text-slate-500">Create a new job listing</p>
          </div>
        </Link>
        <Link
          href="/employer/applicants"
          className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-primary-200 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-slate-900">Review Applicants</p>
            <p className="text-sm text-slate-500">12 new applications</p>
          </div>
        </Link>
        <Link
          href="/employer/company"
          className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-primary-200 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-slate-900">Company Profile</p>
            <p className="text-sm text-slate-500">Update your profile</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
