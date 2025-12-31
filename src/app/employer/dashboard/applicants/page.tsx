'use client';

export default function EmployerApplicantsPage() {
  const applicants = [
    { id: 1, name: 'Maria Santos', position: 'Senior Frontend Developer', status: 'New', date: '2 hours ago', avatar: 'MS', match: 95 },
    { id: 2, name: 'John Cruz', position: 'Backend Engineer', status: 'Reviewed', date: '5 hours ago', avatar: 'JC', match: 88 },
    { id: 3, name: 'Ana Reyes', position: 'UI/UX Designer', status: 'Interview', date: '1 day ago', avatar: 'AR', match: 92 },
    { id: 4, name: 'Miguel Torres', position: 'Senior Frontend Developer', status: 'New', date: '1 day ago', avatar: 'MT', match: 85 },
    { id: 5, name: 'Sofia Garcia', position: 'DevOps Engineer', status: 'Shortlisted', date: '2 days ago', avatar: 'SG', match: 90 },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
        <p className="text-slate-500 mt-1">Review and manage job applications</p>
      </div>

      <div className="grid gap-4">
        {applicants.map((applicant) => (
          <div key={applicant.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                {applicant.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{applicant.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    applicant.status === 'New' ? 'bg-blue-100 text-blue-700' :
                    applicant.status === 'Reviewed' ? 'bg-slate-100 text-slate-600' :
                    applicant.status === 'Interview' ? 'bg-purple-100 text-purple-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {applicant.status}
                  </span>
                </div>
                <p className="text-slate-500 text-sm">{applicant.position}</p>
                <p className="text-xs text-slate-400 mt-1">Applied {applicant.date}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600">{applicant.match}%</p>
                <p className="text-xs text-slate-400">Match</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm rounded-lg transition-colors">
                  View Profile
                </button>
                <button className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors">
                  Message
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
