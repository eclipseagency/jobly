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
    interviewers: ['HR Manager', 'Tech Lead'],
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
    interviewers: ['CTO', 'HR Director'],
  },
  {
    id: '3',
    title: 'React Developer',
    company: 'Digital Ventures',
    date: 'Dec 15, 2024',
    time: '3:00 PM',
    type: 'Video Call',
    platform: 'Zoom',
    status: 'completed',
    result: 'Passed - Moving to final round',
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Interviews</h1>
        <p className="text-slate-600">Manage your scheduled interviews and review past sessions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-primary-600">{upcomingInterviews.length}</p>
          <p className="text-sm text-slate-500">Upcoming</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-green-600">{pastInterviews.filter((i) => i.result?.includes('Passed')).length}</p>
          <p className="text-sm text-slate-500">Passed</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-slate-600">{pastInterviews.length}</p>
          <p className="text-sm text-slate-500">Completed</p>
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Interviews</h2>
        {upcomingInterviews.length > 0 ? (
          <div className="space-y-4">
            {upcomingInterviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">{interview.title}</h3>
                        <p className="text-slate-600">{interview.company}</p>
                      </div>
                      <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        Confirmed
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-slate-500">Date</p>
                        <p className="font-medium text-slate-800">{interview.date}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Time</p>
                        <p className="font-medium text-slate-800">{interview.time}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Type</p>
                        <p className="font-medium text-slate-800">{interview.type}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">{interview.platform ? 'Platform' : 'Location'}</p>
                        <p className="font-medium text-slate-800">{interview.platform || interview.location}</p>
                      </div>
                    </div>
                    {interview.interviewers && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-500 mb-1">Interviewers</p>
                        <div className="flex flex-wrap gap-2">
                          {interview.interviewers.map((person, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                              {person}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Join Meeting
                      </button>
                      <button className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded-lg transition-colors">
                        Reschedule
                      </button>
                      <button className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
                        Add to Calendar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-500">No upcoming interviews</p>
          </div>
        )}
      </div>

      {/* Past Interviews */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Past Interviews</h2>
        <div className="space-y-4">
          {pastInterviews.map((interview) => (
            <div
              key={interview.id}
              className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{interview.title}</h3>
                    <p className="text-sm text-slate-600">{interview.company}</p>
                    <p className="text-sm text-slate-500 mt-1">{interview.date} at {interview.time}</p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    interview.result?.includes('Passed')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {interview.result}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
