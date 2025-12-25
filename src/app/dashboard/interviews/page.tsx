'use client';

const interviews = [
  {
    id: '1',
    title: 'Full Stack Developer',
    company: 'StartUp Hub PH',
    date: 'Dec 24, 2024',
    time: '2:00 PM',
    type: 'Video Call',
    platform: 'Google Meet',
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Senior Developer',
    company: 'Tech Corp',
    date: 'Dec 28, 2024',
    time: '10:00 AM',
    type: 'On-site',
    location: 'Makati Office',
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'React Developer',
    company: 'Digital Ventures',
    date: 'Dec 15, 2024',
    time: '3:00 PM',
    type: 'Video Call',
    status: 'completed',
    result: 'Passed',
  },
  {
    id: '4',
    title: 'Frontend Engineer',
    company: 'AppWorks Studio',
    date: 'Dec 10, 2024',
    time: '11:00 AM',
    type: 'Phone',
    status: 'completed',
    result: 'Not selected',
  },
];

export default function InterviewsPage() {
  const upcomingInterviews = interviews.filter((i) => i.status === 'upcoming');
  const pastInterviews = interviews.filter((i) => i.status === 'completed');

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Interviews</h1>
        <p className="text-slate-500 mt-1">Manage your scheduled interviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
          <p className="text-2xl font-semibold text-primary-600">{upcomingInterviews.length}</p>
          <p className="text-sm text-slate-500">Upcoming</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
          <p className="text-2xl font-semibold text-green-600">{pastInterviews.filter((i) => i.result === 'Passed').length}</p>
          <p className="text-sm text-slate-500">Passed</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
          <p className="text-2xl font-semibold text-slate-600">{pastInterviews.length}</p>
          <p className="text-sm text-slate-500">Completed</p>
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="mb-8">
        <h2 className="font-semibold text-slate-900 mb-4">Upcoming</h2>
        {upcomingInterviews.length > 0 ? (
          <div className="space-y-4">
            {upcomingInterviews.map((interview) => (
              <div key={interview.id} className="bg-white rounded-lg border border-slate-200 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-slate-900">{interview.title}</h3>
                        <p className="text-sm text-slate-500">{interview.company}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-medium rounded">
                        Confirmed
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {interview.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {interview.time}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                        {interview.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Join Meeting
                      </button>
                      <button className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded-lg transition-colors">
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No upcoming interviews</p>
          </div>
        )}
      </div>

      {/* Past Interviews */}
      <div>
        <h2 className="font-semibold text-slate-900 mb-4">Past</h2>
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="divide-y divide-slate-100">
            {pastInterviews.map((interview) => (
              <div key={interview.id} className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900">{interview.title}</h3>
                  <p className="text-sm text-slate-500">{interview.company} - {interview.date}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded ${
                  interview.result === 'Passed' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {interview.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
