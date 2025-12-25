'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

interface Interview {
  id: string;
  title: string;
  company: string;
  companyAvatar: string;
  date: string;
  time: string;
  type: 'video' | 'onsite' | 'phone';
  platform?: string;
  location?: string;
  meetingLink?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  result?: 'Passed' | 'Not selected' | 'Pending';
  notes?: string;
  interviewerName?: string;
  interviewerRole?: string;
}

const initialInterviews: Interview[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechFlow Solutions',
    companyAvatar: 'TS',
    date: '2024-12-26',
    time: '14:00',
    type: 'video',
    platform: 'Google Meet',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'upcoming',
    interviewerName: 'Maria Santos',
    interviewerRole: 'Engineering Manager',
    notes: 'Technical interview focusing on React and TypeScript',
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartUp Hub PH',
    companyAvatar: 'SH',
    date: '2024-12-28',
    time: '10:00',
    type: 'onsite',
    location: 'Unit 1205, One Bonifacio High Street, BGC, Taguig',
    status: 'upcoming',
    interviewerName: 'John Cruz',
    interviewerRole: 'CTO',
    notes: 'Final interview with the founding team',
  },
  {
    id: '3',
    title: 'React Developer',
    company: 'Digital Ventures',
    companyAvatar: 'DV',
    date: '2024-12-15',
    time: '15:00',
    type: 'video',
    platform: 'Zoom',
    status: 'completed',
    result: 'Passed',
  },
  {
    id: '4',
    title: 'Frontend Engineer',
    company: 'AppWorks Studio',
    companyAvatar: 'AS',
    date: '2024-12-10',
    time: '11:00',
    type: 'phone',
    status: 'completed',
    result: 'Not selected',
  },
  {
    id: '5',
    title: 'UI Developer',
    company: 'Creative Labs',
    companyAvatar: 'CL',
    date: '2024-12-20',
    time: '09:00',
    type: 'video',
    platform: 'Microsoft Teams',
    status: 'completed',
    result: 'Pending',
  },
];

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingInterviews = interviews.filter((i) => i.status === 'upcoming');
  const pastInterviews = interviews.filter((i) => i.status === 'completed' || i.status === 'cancelled');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTimeUntil = (dateStr: string, timeStr: string) => {
    const interviewDate = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    const diff = interviewDate.getTime() - now.getTime();

    if (diff < 0) return 'Past';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Starting soon';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'onsite':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'phone':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
    }
  };

  const handleReschedule = () => {
    if (!selectedInterview || !rescheduleData.date || !rescheduleData.time) return;

    setInterviews(interviews.map(i =>
      i.id === selectedInterview.id
        ? { ...i, date: rescheduleData.date, time: rescheduleData.time }
        : i
    ));
    setShowRescheduleModal(false);
    setRescheduleData({ date: '', time: '' });
  };

  const handleCancel = () => {
    if (!selectedInterview) return;

    setInterviews(interviews.map(i =>
      i.id === selectedInterview.id
        ? { ...i, status: 'cancelled' as const }
        : i
    ));
    setShowCancelModal(false);
  };

  const openDetails = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowDetailsModal(true);
  };

  const openReschedule = (interview: Interview) => {
    setSelectedInterview(interview);
    setRescheduleData({ date: interview.date, time: interview.time });
    setShowRescheduleModal(true);
  };

  const openCancel = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowCancelModal(true);
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Interviews</h1>
        <p className="text-slate-500 mt-1">Manage your scheduled interviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{upcomingInterviews.length}</p>
              <p className="text-xs text-slate-500">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pastInterviews.filter(i => i.result === 'Passed').length}</p>
              <p className="text-xs text-slate-500">Passed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pastInterviews.filter(i => i.result === 'Pending').length}</p>
              <p className="text-xs text-slate-500">Awaiting Result</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pastInterviews.length}</p>
              <p className="text-xs text-slate-500">Total Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'upcoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upcoming ({upcomingInterviews.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'past' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Past ({pastInterviews.length})
        </button>
      </div>

      {/* Upcoming Interviews */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingInterviews.length > 0 ? (
            upcomingInterviews.map((interview) => (
              <div key={interview.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
                      {interview.companyAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{interview.title}</h3>
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                          {getTimeUntil(interview.date, interview.time)}
                        </span>
                      </div>
                      <p className="text-sm text-primary-600 font-medium mb-2">{interview.company}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(interview.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(interview.time)}
                        </span>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                          {getTypeIcon(interview.type)}
                          <span className="capitalize">{interview.type === 'video' ? interview.platform : interview.type}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
                    <button
                      onClick={() => openDetails(interview)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-medium rounded-lg transition-colors"
                    >
                      Details
                    </button>
                    {interview.type === 'video' && interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Join Meeting
                      </a>
                    )}
                    {interview.type === 'onsite' && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(interview.location || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Get Directions
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No upcoming interviews</h3>
              <p className="text-sm text-slate-500">When you get invited for interviews, they will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* Past Interviews */}
      {activeTab === 'past' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {pastInterviews.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {pastInterviews.map((interview) => (
                <div key={interview.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                      {getTypeIcon(interview.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900">{interview.title}</h3>
                        {interview.status === 'cancelled' && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded">Cancelled</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{interview.company} &bull; {formatDate(interview.date)}</p>
                    </div>
                    {interview.result && (
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        interview.result === 'Passed' ? 'bg-green-50 text-green-700' :
                        interview.result === 'Pending' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {interview.result}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-slate-500">No past interviews</p>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Interview Details" size="lg">
        {selectedInterview && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-primary-600 font-bold text-lg">
                {selectedInterview.companyAvatar}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedInterview.title}</h3>
                <p className="text-primary-600 font-medium">{selectedInterview.company}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Date</p>
                <p className="font-medium text-slate-900">{formatDate(selectedInterview.date)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Time</p>
                <p className="font-medium text-slate-900">{formatTime(selectedInterview.time)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Type</p>
                <p className="font-medium text-slate-900 capitalize">{selectedInterview.type} {selectedInterview.platform && `(${selectedInterview.platform})`}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <p className="font-medium text-green-600">Confirmed</p>
              </div>
            </div>

            {selectedInterview.location && (
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Location</p>
                <p className="font-medium text-slate-900">{selectedInterview.location}</p>
              </div>
            )}

            {selectedInterview.interviewerName && (
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Interviewer</p>
                <p className="font-medium text-slate-900">{selectedInterview.interviewerName}</p>
                {selectedInterview.interviewerRole && (
                  <p className="text-sm text-slate-500">{selectedInterview.interviewerRole}</p>
                )}
              </div>
            )}

            {selectedInterview.notes && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium mb-1">Notes</p>
                <p className="text-sm text-amber-800">{selectedInterview.notes}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {selectedInterview.status === 'upcoming' && (
                <>
                  <button
                    onClick={() => { setShowDetailsModal(false); openReschedule(selectedInterview); }}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => { setShowDetailsModal(false); openCancel(selectedInterview); }}
                    className="flex-1 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors"
                  >
                    Cancel Interview
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reschedule Modal */}
      <Modal isOpen={showRescheduleModal} onClose={() => setShowRescheduleModal(false)} title="Reschedule Interview">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Select a new date and time for your interview with {selectedInterview?.company}.</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Date</label>
            <input
              type="date"
              value={rescheduleData.date}
              onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Time</label>
            <input
              type="time"
              value={rescheduleData.time}
              onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
            <strong>Note:</strong> The employer will be notified of your reschedule request and must confirm the new time.
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReschedule}
              disabled={!rescheduleData.date || !rescheduleData.time}
              className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors"
            >
              Request Reschedule
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Interview">
        <div className="space-y-4">
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-semibold text-red-900 mb-1">Are you sure?</h3>
            <p className="text-sm text-red-700">
              You are about to cancel your interview for <strong>{selectedInterview?.title}</strong> at <strong>{selectedInterview?.company}</strong>.
            </p>
          </div>
          <p className="text-sm text-slate-600">
            Cancelling interviews may affect your chances with this employer. Consider rescheduling instead if you have a conflict.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors"
            >
              Keep Interview
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Cancel Interview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
