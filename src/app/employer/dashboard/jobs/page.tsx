'use client';

export default function EmployerJobsPage() {
  const jobs = [
    { id: 1, title: 'Senior Frontend Developer', status: 'Active', applicants: 45, new: 12, posted: 'Dec 15, 2024', deadline: 'Dec 30, 2024' },
    { id: 2, title: 'Backend Engineer', status: 'Active', applicants: 32, new: 5, posted: 'Dec 18, 2024', deadline: 'Jan 5, 2025' },
    { id: 3, title: 'UI/UX Designer', status: 'Active', applicants: 28, new: 8, posted: 'Dec 20, 2024', deadline: 'Jan 10, 2025' },
    { id: 4, title: 'DevOps Engineer', status: 'Active', applicants: 15, new: 3, posted: 'Dec 22, 2024', deadline: 'Jan 15, 2025' },
    { id: 5, title: 'Product Manager', status: 'Draft', applicants: 0, new: 0, posted: '-', deadline: 'Jan 20, 2025' },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Postings</h1>
          <p className="text-slate-500 mt-1">Manage your job listings</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Post New Job
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Applicants</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Posted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Deadline</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{job.title}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-900">{job.applicants}</p>
                  {job.new > 0 && <p className="text-xs text-primary-600">{job.new} new</p>}
                </td>
                <td className="px-6 py-4 text-slate-500">{job.posted}</td>
                <td className="px-6 py-4 text-slate-500">{job.deadline}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
